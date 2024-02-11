const { BadRequestError } = require('#errors');
const models = require('#models');
const successResponse = require('#response');

/** @type {import("express").RequestHandler} */
exports.login = async (req, res) => {
  const user = await models.users.findOne({
    where: { email: req.body.email, status: 1 }
  });
  if (!user || !(await user.verifyPassword(req.body.password)))
    throw new BadRequestError('Invalid email or password');
  return res.send(
    successResponse({ token: user.generateAuthToken() }, 'Log-in successful')
  );
};

/** @type {import("express").RequestHandler} */
exports.me = async (req, res) => {
  const user = await models.users.findByPk(req.authUser.id, {
    attributes: {
      exclude: ['password']
    }
  });
  return res.send(successResponse(user));
};

/** @type {import("express").RequestHandler} */
// exports.updatePassword = async (req, res) => {
//   const user = await models.users.findByPk(1, {
//     attributes: {
//       exclude: ['password']
//     }
//   });
//   await user.updatePassword('Test@1234');
//   await user.save();
//   return res.send(successResponse(user));
// };
