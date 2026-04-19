const Listing = require("../models/listing.js");

const getUploadedImageData = (file) => {
  if (!file) return null;

  return {
    url: file.path || file.secure_url || file.url,
    filename: file.filename || file.public_id,
  };
};

//------------ GET ALL LISTINGS ---------------------------------
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/all-listings.ejs", { allListings });
};

//---------- NEW ROUTE -----------------------------------------
module.exports.newListingForm = async (req, res) => {
  console.log(req.user);
  res.render("listings/new-listing.ejs");
};

//---------- CREATE ROUTE --------------------------------------
module.exports.createListing = async (req, res, next) => {
  let listingData = req.body.listing;
  const uploadedImage = getUploadedImageData(req.file);

  if (uploadedImage?.url) {
    listingData.image = uploadedImage;
  }

  let newListing = new Listing(listingData);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

//--------- EDIT ROUTE -----------------------------------------
module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit-listing.ejs", { listing });
};

//--------- UPDATE ROUTE ---------------------------------------
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let updatedListing = { ...req.body.listing };
  updatedListing.image = { url: req.body.listing.image };
  let listing = await Listing.findByIdAndUpdate(id, updatedListing);

  if (typeof req.file !== "undefined") {
    const uploadedImage = getUploadedImageData(req.file);

    if (uploadedImage?.url) {
      listing.image = uploadedImage;
      await listing.save();
    }
  }

  req.flash("success", "Listing Updated Successfully !!");
  res.redirect(`/listings/${id}`);
};

//----------- DELETE ROUTE ---------------------------------------
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("error", "Listing Deleted successfully !!");
  res.redirect("/listings");
};

//----------- SHOW ROUTE ---------------------------------------
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found !!");
    return res.redirect("/listings");
  }
  res.render("listings/show-listing.ejs", { listing });
};
