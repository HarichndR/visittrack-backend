const express = require('express');
const authRoute = require('../modules/auth/auth.routes');
const eventRoute = require('../modules/event/event.routes');
const visitorRoute = require('../modules/visitor/visitor.routes');
const exhibitorRoute = require('../modules/exhibitor/exhibitor.routes');
const userRoute = require('../modules/user/user.routes');
const dashboardRoute = require('../modules/dashboard/dashboard.routes');
const logsRoute = require('../modules/logs/logs.routes');
const formRoute = require('../modules/form/form.routes');
const formTemplateRoute = require('../modules/form/formTemplate.routes');
const leadRoute = require('../modules/lead/lead.routes');
const qrRoute = require('../modules/qr/qr.routes');
const reportRoute = require('../modules/report/report.routes');
const organizationRoute = require('../modules/organization/organization.routes');
const mediaRoute = require('../modules/media/media.routes');
const stallRoute = require('../modules/stall/stall.routes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/events',
    route: eventRoute,
  },
  {
    path: '/visitors',
    route: visitorRoute,
  },
  {
    path: '/exhibitors',
    route: exhibitorRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/logs',
    route: logsRoute,
  },
  {
    path: '/forms',
    route: formRoute,
  },
  {
    path: '/form-templates',
    route: formTemplateRoute,
  },
  {
    path: '/leads',
    route: leadRoute,
  },
  {
    path: '/qr',
    route: qrRoute,
  },
  {
    path: '/reports',
    route: reportRoute,
  },
  {
    path: '/organizations',
    route: organizationRoute,
  },
  {
    path: '/media',
    route: mediaRoute,
  },
  {
    path: '/stalls',
    route: stallRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
