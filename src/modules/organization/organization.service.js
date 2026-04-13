const Organization = require('./organization.model');
const ApiError = require('../../utils/customError');

const createOrganization = async (orgBody) => {
  return Organization.create(orgBody);
};

const getOrganizationByOwner = async (ownerId) => {
  return Organization.findOne({ owner: ownerId });
};

const getOrganizationById = async (id) => {
  return Organization.findById(id);
};

const queryOrganizations = async (filter = {}) => {
  return Organization.find({ isActive: true, ...filter });
};

const updateOrganizationById = async (orgId, updateBody) => {
  const org = await getOrganizationById(orgId);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }
  Object.assign(org, updateBody);
  await org.save();
  return org;
};

module.exports = {
  createOrganization,
  getOrganizationByOwner,
  getOrganizationById,
  queryOrganizations,
  updateOrganizationById,
};
