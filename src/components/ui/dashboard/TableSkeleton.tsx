import React from "react";

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-dark-100 border border-[#334155]  overflow-hidden max-tab-lg:hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-5/10 border-b border-[#334155]">
            <tr className="">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider font-sofia-sans"
                  >
                    <div className="h-3 w-24 bg-gray-5/30 rounded animate-pulse" />
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-5/20">
            {Array(rows)
              .fill(null)
              .map((_, i) => (
                <tr key={i} className="border-[#334155] border-[1px]">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-gray-5/30  animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-5/30  animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-5/30  animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-10 bg-gray-5/30  animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-gray-5/30  animate-pulse" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 w-8 bg-gray-5/30  animate-pulse ml-auto" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
