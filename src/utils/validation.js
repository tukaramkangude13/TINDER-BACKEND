 export const validtaeprofliedata = (req) => {
    const allowedmethod = [
    "firstName",
    "emailId",
    "age",
    "lastName",
    "address",
    "gender",
    "about",
    "skills",
    "photoUrl",
  ];
  const isAllowed = Object.keys(req.body).every((field) =>
    allowedmethod.includes(field)
  );

  return isAllowed;
};
