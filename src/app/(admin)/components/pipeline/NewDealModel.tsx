import Link from "next/link";
import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchStagesByPipeline } from "@/redux/slices/stageSlice";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import { createUser } from "@/redux/slices/usersSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchPipelineById } from "@/redux/slices/pipelineSlice";
import { fetchAllCustomers } from "@/redux/slices/customersSlice";

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded?: (stageId?: string) => Promise<void>;
}

type ContactMode = "existing" | "new";

const NewDealModal: React.FC<NewDealModalProps> = ({
  isOpen,
  onClose,
  onContactAdded
}) => {
  const [contactMode, setContactMode] = useState<ContactMode>("existing");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pipeline: "",
    stage: "",
    email: "",
    firstName: "",
    surname: "",
    company: "",
    telephone: "",
    contact: "",
  });
  const dispatch = useDispatch<AppDispatch>();

  // Get the current user (consultant) from your auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);
  // Get customers from customersSlice instead of usersSlice
  const customers = useSelector((state: RootState) => state.customers.customers);
  const pipelines = useSelector((state: RootState) => state.pipeline.pipelines);
  const currentPipeline = useSelector((state: RootState) => state.pipeline.currentPipeline);
  const stages = useSelector((state: RootState) => state.stage.stages);
  const companies = useSelector((state: RootState) => state.companies.companies);

  console.debug("Pipelines:", pipelines);

  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const pipelineId = urlParams.get("id");
      if (pipelineId) {
        dispatch(fetchStagesByPipeline(pipelineId));
      }

      // Fetch and pre-fill pipeline if ID is present in URL
      if (pipelineId) {
        dispatch(fetchPipelineById(pipelineId)).then((action) => {
          if (fetchPipelineById.fulfilled.match(action)) {
            setFormData(prev => ({ ...prev, pipeline: action.payload.id.toString() }));
          }
        });
      }
      // Only fetch companies if contactMode is "existing"
      if (contactMode === "existing") {
        dispatch(fetchCompanies({}));
      }
    }
  }, [isOpen, contactMode, dispatch]);

  // Fetch only the current consultant's customers using customersSlice
  useEffect(() => {
    if (isOpen && contactMode === "existing" && currentUser?.id) {
      // Fetch customers filtered by consultant_id (current user's ID)
      dispatch(fetchAllCustomers());
    }
  }, [isOpen, contactMode, dispatch, currentUser]);

  // Filter customers by consultant_id on the client side
  const filteredCustomers = customers.filter(
    customer => customer.consultant_id === currentUser?.id
  );

  // Clear company field when switching to new contact mode
  useEffect(() => {
    if (contactMode === "new") {
      setFormData(prev => ({ ...prev, company: "" }));
    }
  }, [contactMode]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid = () => {
    if (contactMode === "existing") {
      return formData.contact && formData.pipeline && formData.stage;
    } else {
      return (
        formData.firstName.trim() &&
        formData.surname.trim() &&
        formData.email.trim() &&
        /\S+@\S+\.\S+/.test(formData.email) &&
        formData.telephone.trim() &&
        formData.pipeline &&
        formData.stage
      );
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Prepare the payload - convert empty strings to undefined for optional UUID fields
      const payload = {
        first_name: formData.firstName,
        last_name: formData.surname,
        email: formData.email,
        phone: formData.telephone,
        company_id: formData.company || undefined,
        pipeline_id: formData.pipeline,
        stage_id: formData.stage,
      };

      await dispatch(createUser(payload)).unwrap();
      
      toast.success("User created successfully!");

      // Call the callback with the stage ID to update counts immediately
      if (onContactAdded && formData.stage) {
        await onContactAdded(formData.stage);
      }

      // Reset form data after successful submission
      setFormData({
        pipeline: "",
        stage: "",
        email: "",
        firstName: "",
        surname: "",
        company: "",
        telephone: "",
        contact: "",
      });

      onClose();
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Create a new deal</h2>
          <Link
            href=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </Link>
        </div>

        <div className="p-4">
          <div className="flex mb-4">
            <button
              className={`px-4 py-2 rounded-md ${
                contactMode === "existing"
                  ? "bg-yellow-400 text-black"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
              onClick={() => setContactMode("existing")}
            >
              Existing contacts
            </button>
            <button
              className={`ml-2 px-4 py-2 rounded-md flex items-center ${
                contactMode === "new"
                  ? "bg-yellow-400 text-black"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
              onClick={() => setContactMode("new")}
            >
              <span className="mr-1">👤</span>New contact
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {contactMode === "existing" && (
              <>
                <div>
                  <label className="block mb-2">Existing contacts</label>
                  <select
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Choose a contact:</option>
                    {filteredCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.deal_name
                          ? customer.deal_name.replace(/ - Deal$/, "")
                          : (customer.first_name || customer.last_name
                            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                            : "No name")}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Display current pipeline name as a read-only field */}
            {currentPipeline && (
              <div>
                <label className="block mb-2">Pipeline</label>
                <input
                  type="text"
                  value={currentPipeline.name}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label className="block mb-2">Stages</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select stage</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block mb-2">First name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Surname</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Only show company dropdown for existing contacts */}
            {contactMode === "existing" && (
              <div>
                <label className="block mb-2">Company</label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Choose a company:</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block mb-2">Telephone number</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 mr-2 bg-gray-500 text-white rounded hover:bg-gray-600 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid()}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${
              isLoading || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding...
              </>
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDealModal;