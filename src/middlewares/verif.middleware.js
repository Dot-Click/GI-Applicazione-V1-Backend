import "dotenv/config";

/**
 * This Middleware is used to check roles from the upcoming token after authentication and based on the given role allow access to the next service
 * @param requiredRoles An array of roles e.g ["USER", "ADMIN"]
 */

export const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      let role = req.user?.role;
      if(!role){
        role = "USER"  //agr role nhi ara or ye wala middlware req pr lga wa hai then role by default USER hojayega
      }
      // console.log(role)
      if (!requiredRoles.includes(role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: You don't have permission" });
      }
      next();
    } catch (error) {
      // console.log(error.message);
      return res.status(401).json({ message: error.message });
    }
  };
};
