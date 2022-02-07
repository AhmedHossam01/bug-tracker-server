module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '4f846fac070e39119ec90e558936fbe7'),
  },
});
