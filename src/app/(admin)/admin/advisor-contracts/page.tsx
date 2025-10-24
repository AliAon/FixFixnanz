"use client";

const ContractOverviewPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl text-primary  font-semibold mb-">
        Contract overview
      </h2>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border border-gray-300">
            <thead className="bg-gray-100">
              <tr className="text-left">
                {[
                  "Contract number",
                  "Username",
                  "Society",
                  "Amount",
                  "Payment",
                  "Contract duration",
                  "Category",
                  "Start of contract",
                  "End of contract",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 font-semibold border-b border-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-3 text-center bg-[#DC3545] text-white font-semibold"
                >
                  Not Contract Created Yet !!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractOverviewPage;
