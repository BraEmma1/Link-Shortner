import Link from '../models/Link.js';
import Analytics from '../models/Analytics.js';
import QRCodeModel from '../models/QRCode.js';
import mongoose from 'mongoose';

export const getOverallAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days, startDate, endDate } = req.query;

    const links = await Link.find({ userId }).select('_id title slug shortUrl clicks status').lean();
    const linkIds = links.map((link) => link._id);

    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
    const activeLinksCount = links.filter((l) => l.status === 'active').length;
    const topLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5);

    let matchStartDate;
    let matchEndDate = new Date();
    let numDays = 30;

    if (startDate && endDate) {
      matchStartDate = new Date(startDate);
      matchStartDate.setHours(0, 0, 0, 0);
      matchEndDate = new Date(endDate);
      matchEndDate.setHours(23, 59, 59, 999);
      const diffTime = Math.abs(matchEndDate - matchStartDate);
      numDays = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 365);
    } else {
      numDays = parseInt(days, 10) || 30;
      if (numDays <= 0) numDays = 30;
      matchStartDate = new Date();
      matchStartDate.setDate(matchStartDate.getDate() - numDays + 1);
      matchStartDate.setHours(0, 0, 0, 0);
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const dateMatchCriteria = {
      linkId: { $in: linkIds },
      clickedAt: { $gte: matchStartDate, $lte: matchEndDate },
    };

    const [dailyClicks, deviceBreakdown, trafficSources, clicksTodayData] = await Promise.all([
      Analytics.aggregate([
        { $match: dateMatchCriteria },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, clicks: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Analytics.aggregate([
        { $match: dateMatchCriteria },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.aggregate([
        { $match: dateMatchCriteria },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Analytics.aggregate([
        { $match: { linkId: { $in: linkIds }, clickedAt: { $gte: startOfToday } } },
        { $count: 'clicksToday' },
      ]),
    ]);

    const clicksToday = clicksTodayData.length > 0 ? clicksTodayData[0].clicksToday : 0;

    const formattedDailyClicks = [];
    const tempDate = new Date(matchStartDate);
    for (let i = 0; i < numDays; i++) {
      const dateString = tempDate.toISOString().split('T')[0];
      const match = dailyClicks.find((item) => item._id === dateString);
      formattedDailyClicks.push({ date: dateString, clicks: match ? match.clicks : 0 });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const totalClicksInRange = dailyClicks.reduce((sum, item) => sum + item.clicks, 0);

    res.status(200).json({
      success: true,
      data: {
        totalClicks: totalClicksInRange,
        topLinks,
        dailyClicks: formattedDailyClicks,
        totalLinksCount: links.length,
        activeLinksCount,
        clicksToday,
        deviceBreakdown: deviceBreakdown.map((i) => ({ device: i._id || 'Unknown', count: i.count })),
        trafficSources: trafficSources.map((i) => ({ source: i._id || 'Direct', count: i.count })),
      },
    });
  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

import qrcode from 'qrcode';

export const getLinkAnalytics = async (req, res) => {
  try {
    const { linkId } = req.params;

    const link = await Link.findOne({ _id: linkId, userId: req.user._id }).lean();
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found or not authorized' });
    }

    const fullUrl = `${process.env.BASE_URL || 'https://thevaultzmedia.com'}/${link.slug}`;
    let qrCodeUrl = '';

    try {
      let qrMeta = await QRCodeModel.findOne({ linkId }).lean();
      if (!qrMeta) {
        const newQrMeta = await QRCodeModel.create({ linkId, userId: req.user._id });
        qrMeta = newQrMeta.toObject();
      }
      qrCodeUrl = await qrcode.toDataURL(fullUrl, {
        color: {
          dark: qrMeta.foregroundColor || '#000000',
          light: qrMeta.backgroundColor || '#ffffff',
        },
        margin: qrMeta.margin ?? 4,
        errorCorrectionLevel: qrMeta.errorCorrectionLevel || 'M',
      });
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const linkObjectId = new mongoose.Types.ObjectId(linkId);

    const [trafficSources, deviceBreakdown, browserBreakdown, osBreakdown, geographicDistribution, uniqueVisitorsAggr, dailyClicksAggr] = await Promise.all([
      Analytics.aggregate([
        { $match: { linkId: linkObjectId } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Analytics.aggregate([
        { $match: { linkId: linkObjectId } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.aggregate([
        { $match: { linkId: linkObjectId } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Analytics.aggregate([
        { $match: { linkId: linkObjectId } },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Analytics.aggregate([
        { $match: { linkId: linkObjectId } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      Analytics.aggregate([
        { $match: { linkId: linkObjectId } },
        { $group: { _id: '$ipAddress' } },
        { $count: 'uniqueCount' },
      ]),
      Analytics.aggregate([
        { $match: { linkId: linkObjectId, clickedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, clicks: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const uniqueVisitors = uniqueVisitorsAggr.length > 0 ? uniqueVisitorsAggr[0].uniqueCount : 0;

    const formattedDailyClicks = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const match = dailyClicksAggr.find((item) => item._id === dateString);
      formattedDailyClicks.push({ date: dateString, clicks: match ? match.clicks : 0 });
    }

    const totalClicks = link.clicks;
    const addPercentage = (arr) =>
      arr.map((i) => ({
        ...i,
        id: i._id,
        count: i.count,
        percentage: totalClicks > 0 ? Math.round((i.count / totalClicks) * 100) : 0,
      }));

    res.status(200).json({
      success: true,
      data: {
        linkDetails: {
          title: link.title,
          shortUrl: fullUrl,
          originalUrl: link.targetUrl,
          totalClicks: link.clicks,
          uniqueVisitors,
          qrCodeUrl,
        },
        dailyClicks: formattedDailyClicks,
        trafficSources: addPercentage(trafficSources).map((i) => ({ source: i.id, count: i.count, percentage: i.percentage })),
        deviceBreakdown: addPercentage(deviceBreakdown).map((i) => ({ device: i.id, count: i.count, percentage: i.percentage })),
        browserBreakdown: addPercentage(browserBreakdown).map((i) => ({ browser: i.id, count: i.count, percentage: i.percentage })),
        osBreakdown: addPercentage(osBreakdown).map((i) => ({ os: i.id, count: i.count, percentage: i.percentage })),
        geographicDistribution: addPercentage(geographicDistribution).map((i) => ({ country: i.id, count: i.count, percentage: i.percentage })),
      },
    });
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
