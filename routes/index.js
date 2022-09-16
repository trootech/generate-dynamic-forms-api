const express = require('express');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/',
    route: require('./forms.route'),
  },
  {
    path: '/',
    route: require('./auth.routes'),
  },
  {
    path: '/',
    route: require('./user.routes'),
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;