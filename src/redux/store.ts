import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoriesReducer from "./slices/categoriesSlice";
import profileReducer from "./slices/profileSlice";
import meetingReducer from "./slices/meetingsSlice";
import calendarSettingsReducer from "./slices/calendarSettingsSlice";
import contractCategoriesReducer from './slices/contractCategoriesSlice';
import advisorContractReducer from './slices/advisorContractSlice';
import advisorsReducer from './slices/advisorsSlice';
import usersReducer from './slices/usersSlice';
import customersReducer from './slices/customersSlice';
import appointmentsReducer from "./slices/appointmentsSlice";
import companiesReducer from './slices/companiesSlice';
import supportCategoriesReducer from './slices/supportCategoriesSlice';
import supportFaqsReducer from './slices/supportFaqsSlice';
import supportWelcomeMessageReducer from './slices/supportWelcomeMessageSlice';
import userAddressReducer from "./slices/userAddressSlice";
import pipelineReducer from "./slices/pipelineSlice";
import stageReducer from "./slices/stageSlice";
import emailSignatureReducer from "./slices/emailSignatureSlice";
import leadTrackingReducer from "./slices/leadTrackingSlice";
import notificationTemplateFiltersReducer from "./slices/notificationTemplateSlice";
import marketingPackagesReducer from "./slices/marketingPackagesSlice";
import contractsReducer from "./slices/contractsSlice";
import dynamicFormsReducer from "./slices/dynamicFormsSlice";
import messagesReducer from "./slices/messagesSlice";
import campaignReducer from "./slices/campaignSlice";
import metaGraphReducer from "./slices/metaGraphSlice";
import funnelReducer from './slices/funnelSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    profile: profileReducer,
    meetings: meetingReducer,
    calendarSettings: calendarSettingsReducer,
    contractCategories: contractCategoriesReducer,
    advisorContract: advisorContractReducer,
    advisors: advisorsReducer,
    users: usersReducer,
    customers: customersReducer,
    appointments: appointmentsReducer,
    companies: companiesReducer,
    supportCategories: supportCategoriesReducer,
    supportFaqs: supportFaqsReducer,
    supportWelcomeMessage: supportWelcomeMessageReducer,
    userAddress: userAddressReducer,
    pipeline: pipelineReducer,
    stage: stageReducer,
    emailSignature: emailSignatureReducer,
    leadTracking: leadTrackingReducer,
    notificationTemplateFilters: notificationTemplateFiltersReducer,
    marketingPackages: marketingPackagesReducer,
    contracts: contractsReducer,
    dynamicForms: dynamicFormsReducer,
    messages: messagesReducer,
    campaign: campaignReducer,
    metaGraph: metaGraphReducer,
    funnel: funnelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;