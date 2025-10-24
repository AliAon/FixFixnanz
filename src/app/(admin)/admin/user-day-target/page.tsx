"use client";

import { useState } from "react";

interface Employee {
  id: number;
  name: string;
  calls: number;
  telephoneTermine: number;
  videoTermine: number;
  saleVolumn: number;
}

const UserDayTargetPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Admin Fixfinanz",
      calls: 5,
      telephoneTermine: 8,
      videoTermine: 8,
      saleVolumn: 1,
    },
    {
      id: 2,
      name: "Andreas Kosche",
      calls: 50,
      telephoneTermine: 10,
      videoTermine: 8,
      saleVolumn: 1,
    },
    {
      id: 3,
      name: "Raja Ziafat",
      calls: 8,
      telephoneTermine: 8,
      videoTermine: 8,
      saleVolumn: 8,
    },
    {
      id: 4,
      name: "Dennis Schaible",
      calls: 8,
      telephoneTermine: 8,
      videoTermine: 8,
      saleVolumn: 8,
    },
  ]);

  const handleInputChange = (employeeId: number, field: keyof Omit<Employee, 'id' | 'name'>, value: string) => {
    const numericValue = parseInt(value) || 0;
    
    setEmployees(employees.map(employee => {
      if (employee.id === employeeId) {
        return {
          ...employee,
          [field]: numericValue
        };
      }
      return employee;
    }));
  };

  const handleSubmit = () => {
    console.log("Updated employee targets:", employees);
    alert("Targets updated successfully!");
  };

  return (
    <div className="bg-gray-50 p-8 rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Employe target setting</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-3 text-left text-gray-800 font-bold">Full Name</th>
              <th className="py-3 text-left text-gray-800 font-bold">Calls</th>
              <th className="py-3 text-left text-gray-800 font-bold">Termine Telephone</th>
              <th className="py-3 text-left text-gray-800 font-bold">Termine Video</th>
              <th className="py-3 text-left text-gray-800 font-bold">Sale Volumn</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b border-gray-200">
                <td className="py-4 pr-4">
                  <div className="text-gray-800 font-medium">{employee.name}</div>
                </td>
                <td className="py-4 pr-4">
                  <input
                    type="number"
                    value={employee.calls}
                    onChange={(e) => handleInputChange(employee.id, 'calls', e.target.value)}
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </td>
                <td className="py-4 pr-4">
                  <input
                    type="number"
                    value={employee.telephoneTermine}
                    onChange={(e) => handleInputChange(employee.id, 'telephoneTermine', e.target.value)}
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </td>
                <td className="py-4 pr-4">
                  <input
                    type="number"
                    value={employee.videoTermine}
                    onChange={(e) => handleInputChange(employee.id, 'videoTermine', e.target.value)}
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </td>
                <td className="py-4 pr-4">
                  <input
                    type="number"
                    value={employee.saleVolumn}
                    onChange={(e) => handleInputChange(employee.id, 'saleVolumn', e.target.value)}
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-[#111D45] text-white py-3 px-6 rounded-md font-medium hover:bg-[#1a2b5a] transition-colors"
        >
          Update Target
        </button>
      </div>
    </div>
  );
};

export default UserDayTargetPage;