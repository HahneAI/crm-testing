import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';

const Settings = () => {
  return (
    <DashboardLayout title="Settings">
      <Card title="System Settings">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This section allows you to configure system settings.
        </p>
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">Settings configuration features coming soon.</p>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Settings;