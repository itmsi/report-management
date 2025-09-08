const express = require('express')
const auth = require('../../modules/auth')
const categories = require('../../modules/categories')
const powerBi = require('../../modules/powerBi')
const ssoRoutes = require('./sso')

const routing = express();
const API_TAG = '/api/v1';

/* RULE
naming convention endpoint: using plural
*/

// SSO Routes
routing.use(`${API_TAG}`, ssoRoutes)

// Authentication routes
routing.use(`${API_TAG}/auth`, auth)

// Categories routes
routing.use(`${API_TAG}/categories`, categories)

// PowerBI routes
routing.use(`${API_TAG}/powerbi`, powerBi)

module.exports = routing;
