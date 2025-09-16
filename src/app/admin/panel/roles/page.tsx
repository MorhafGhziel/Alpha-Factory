import prisma from "@/src/lib/prisma";

export default async function RoleManagement() {
  // Get role statistics
  const roleStats = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      role: true,
    },
  });

  // Get recent role changes (we can track this in the future)
  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const roles = [
    {
      name: "owner",
      description: "System owner with full access to admin panel",
      permissions: ["Full system access", "Account management", "Role assignment", "System settings"],
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "admin",
      description: "Administrator with access to management features",
      permissions: ["User management", "Project management", "Group management", "System monitoring"],
      color: "bg-red-100 text-red-800",
    },
    {
      name: "client",
      description: "Client users who can create and manage projects",
      permissions: ["Create projects", "View own projects", "Update project status"],
      color: "bg-green-100 text-green-800",
    },
    {
      name: "designer",
      description: "Design team members",
      permissions: ["View assigned projects", "Update design status", "Upload design files"],
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "reviewer",
      description: "Review team members",
      permissions: ["View assigned projects", "Update review status", "Provide feedback"],
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      name: "editor",
      description: "Video editing team members",
      permissions: ["View assigned projects", "Update editing status", "Upload edited files"],
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of system roles and permissions
        </p>
      </div>

      {/* Role Statistics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Role Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleStats.map((stat) => {
              const roleInfo = roles.find(r => r.name === stat.role);
              return (
                <div key={stat.role} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                        {stat.role || 'No Role'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat._count.role}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {roleInfo?.description || 'No description available'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Definitions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Role Definitions & Permissions
          </h3>
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.name} className="border-l-4 border-blue-400 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900 capitalize">
                    {role.name}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                    {roleStats.find(s => s.role === role.name)?._count.role || 0} users
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {role.description}
                </p>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h5>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li key={index}>{permission}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recently Created Users
          </h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user) => {
                  const roleInfo = roles.find(r => r.name === user.role);
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/admin/panel/accounts`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Manage
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Management Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/panel/accounts"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Manage Accounts
            </a>
            <a
              href="/admin/panel"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Dashboard
            </a>
            <a
              href="/admin/panel/settings"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              System Settings
            </a>
            <a
              href="/admin"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
