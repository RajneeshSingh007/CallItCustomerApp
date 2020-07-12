import { AsyncStorage } from "react-native";

/**
 * Customer Pref Key
 */
export const loggedStatus = "loggedstatus";
export const bearerToken = "logintoken";
export const methodPost = "POST";
export const methodGet = "GET";
export const methodPut = "POST"; //PUT
export const firebaseData = "uniqueData";
export const phoneNumber = "phoneNumber";
export const favData = "favData";
export const cartItem = "cartItem";
export const cartTotalAmt = "cartTotalAmt";
export const CustData = "CustData";
export const DummyLoaderData = "DummyLoaderData";
export const TrackHomePageData = "TrackHomePageData";
export const EditModeEnabled = "EditModeEnabled";
export const citySave = "citySaved";
export const userDeviceID = "userDeviceID";
export const cardList = "cardList";
export const CardAccount = "cgdemo";
export const CardPass = "C!kd2nc3a";
export const CardMid = "11665";
export const TempBizData = "tempbizdata";
export const TempLocBranchData = "templocbranchdata";
export const TempLocOzranchData = "templocozranchdata";
export const AskedLocationDailog = "AskedLocationDailog";
export const HomeReload = 'HomeReload';
export const TOS = 'tos';

/**
 * Business Pref Key
 */
export const bBearerToken = "businesstoken";
export const bLoggedStatus = "businessloggedstatus";
export const bData = "businessdata";
export const bId = "businessid";
export const LASTTOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMTA0MjhjYThmMWM0NDlkYmUwOGE2YmM0MTRiNDIyMSIsIm5hbWVpZCI6ImF1dG9jb21wbHQzMiIsImV4cCI6MTkwMTAzMzQ2OSwiaXNzIjoiY2FsbGl0YXBwbGljYXRpb24iLCJhdWQiOiJjYWxsaXRhcHBsaWNhdGlvbiJ9.czeFZoed1-yKdum3YKN7GIqAzbNMFaT3ms60DWFQ83w";
export const STAGING_CODE_PUSH = "pzTiXQn5GTKQVhOuDjgCCiJy-J8nZS7OEHgR2";
export const PRODUCTION_CODE_PUSH = "LviuK_U1uxkfbpaDPsguwAzF5uc67oaNfJDnC";

//http://djangoman123-001-site1.btempurl.com/
//http://192.236.162.188/
/**
 * Customer Server url
 */
export const BASEURL = "http://djangoman123-001-site1.btempurl.com/";
export const VisaCardImage = `${BASEURL}StaticFiles/Cards/`;
export const SignUpUrl = `${BASEURL}api/CreateCustomer`;
export const AllBusinessListUrl = `${BASEURL}api/getBusinessesForCustomer`;
export const BusinessBranchUrl = `${BASEURL}api/BranchesByBusinessId/`;
export const BusinessBranchDetailUrl = `${BASEURL}api/getBranchForCustomer/`;
export const BranchAllServiceUrl = `${BASEURL}api/getServicesForCustomer/`;
export const ServiceUrl = `${BASEURL}api/getServiceForCustomer/`;
export const AccountCheckUrl = `${BASEURL}api/CustomerByPhone/`;
export const ReviewPostUrl = `${BASEURL}api/PostReview`;
export const GetInfoUrl = `${BASEURL}api/getCustomerDetails`;
export const GetDeliveryPriceUrl = `${BASEURL}api/getDeliveryPrice/`;
export const UpdateUserProfile = `${BASEURL}api/updateCustomerDetails/`;
export const SearchBrachesUrl = `${BASEURL}api/getBranchesForCustomer/`;
export const UpdateTokenUrl = `${BASEURL}api/updateCustomerDevice/`;
export const PostOrderUrl = `${BASEURL}api/postOrderForCustomer/`;
export const GerReviewsUrl = `${BASEURL}api/GetReviews/`;
export const GetBusinessSuggestions = `${BASEURL}API/BusinessSuggestions`;
export const GetBusinessCats = `${BASEURL}API/getBusinessCategories`;
export const GetDeliveryPricesUrl = `${BASEURL}api/DeliveryPrices/`;
export const GetCitiesUrl = `${BASEURL}api/Cities/`;
export const GetDeliveryListItemAutoCompleteSearchUrl = `${BASEURL}api/CitiesAutocomplete/`;
export const RefreshToken = `${BASEURL}api/refreshTokenCustomer/`;
export const GetDeliveryPricesNoGpsUrl = `${BASEURL}api/getDeliveryPriceNoGPS/`;
export const ServerTimeUrl = `${BASEURL}api/getServerTime/`;
export const PizzImageUrl = `${BASEURL}api/GetImagesForPizza/`;
//export const CreditCardUrl = `https://api.creditguard.co.il/merchants/xpo/Relay`;
export const CreditCardUrl = `https://cguat2.creditguard.co.il/xpo/Relay`;
export const GetSessionCardUrl = `${BASEURL}api/getSessionIdForCG`;
export const GetImageForHomepageUrl = `${BASEURL}api/GetImageForHomePage`;
export const CancelOrderUrl = `${BASEURL}api/CancelOrderForCustomer`;
export const BranchStatusUrl = `${BASEURL}api/branchOpenStatus/`;
export const TOSURL = `${BASEURL}api/postToSAgreement`;
export const TOSWEBURL = 'http://callit.co.il/tos/';

/**
 * Business Server Url
 */
export const UserOwnerLoginUrl = `${BASEURL}api/UserownersLogin`;
export const AddServiceUrl = `${BASEURL}api/AddService`;
export const FetchServicesUrl = `${BASEURL}api/ServicesByBranchId/`;
export const UpdateServiceUrl = `${BASEURL}api/ServicesUpdate/`;
export const FetchExtrasUrl = `${BASEURL}api/ExtraByBusiness/`;
export const ExtraCatUrl = `${BASEURL}api/Categories/`;
export const LogOutUrl = `${BASEURL}api/UserownerLogout/`;
export const GetOrdersUrl = `${BASEURL}api/GetOrderForCustomer`;
export const AddExtraUrl = `${BASEURL}api/Extra`;
export const DeleteServiceExtraUrl = `${BASEURL}api/DeleteServiceExtra/`;
export const DeleteExtraUrl = `${BASEURL}api/DeleteExtras/`;
export const AddServiceExtraUrl = `${BASEURL}api/AddServiceExtra/`;
export const UpdateExtraUrl = `${BASEURL}api/UpdateExtra/`;
export const DeleteServiceUrl = `${BASEURL}api/DeleteServices/`;
export const BusinessDetailUrl = `${BASEURL}api/BranchesByBusinessId/0`;
export const BranchUpdateUrl = `${BASEURL}api/UpdateBranch/`;

/**
 * Set Val
 * @param key
 * @param val
 * @returns {Promise<void>}
 */
export const setVal = async (key, val) => {
  let value = JSON.stringify(val);
  if (value) {
    AsyncStorage.setItem(key, value);
  }
};

/**
 * Get value
 * @param key
 * @param callback
 */
export const getVal = (key, callback = (response) => { }) => {
  AsyncStorage.getItem(key).then((value) => {
    callback(value);
  });
};

export const returnCheckNumber = (text) => {
  const checkIsNumber = "/[^0-9]/g";
  return checkIsNumber.test(text);
};
