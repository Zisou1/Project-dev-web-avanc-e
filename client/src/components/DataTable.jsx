import React from "react";

const DataTable = ({ columns, data, actions }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100 w-full z-10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className="py-4 px-6 font-bold text-gray-700 text-lg">
                {col.label}
              </th>
            ))}
            {actions && <th className="py-4 px-6 font-bold text-gray-700 text-lg text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-100 transition">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-6 text-base text-gray-900 max-w-xs truncate">
                  {col.render
                    ? col.render(row)
                    : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="py-3 px-6 text-center">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-lg">Aucun résultat trouvé.</div>
      )}
    </div>
  );
};

export default DataTable;
