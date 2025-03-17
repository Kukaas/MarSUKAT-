import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export function StatusMessage({ type, title, message, steps, reminder }) {
  const getStyles = () => {
    switch (type) {
      case "rejected":
        return {
          container:
            "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
          icon: "bg-red-100 dark:bg-red-800/60 text-red-600 dark:text-red-400",
          title: "text-red-900 dark:text-red-300",
          message: "text-red-700 dark:text-red-400",
          reminder:
            "text-red-600 dark:text-red-500 border-red-200 dark:border-red-800",
        };
      case "warning":
        return {
          container:
            "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
          icon: "bg-yellow-100 dark:bg-yellow-800/60 text-yellow-600 dark:text-yellow-400",
          title: "text-yellow-900 dark:text-yellow-300",
          message: "text-yellow-700 dark:text-yellow-400",
          reminder:
            "text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800",
        };
      case "success":
        return {
          container:
            "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
          icon: "bg-green-100 dark:bg-green-800/60 text-green-600 dark:text-green-400",
          title: "text-green-900 dark:text-green-300",
          message: "text-green-700 dark:text-green-400",
          reminder:
            "text-green-600 dark:text-green-500 border-green-200 dark:border-green-800",
        };
      default:
        return {
          container:
            "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
          icon: "bg-blue-100 dark:bg-blue-800/60 text-blue-600 dark:text-blue-400",
          title: "text-blue-900 dark:text-blue-300",
          message: "text-blue-700 dark:text-blue-400",
          reminder:
            "text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-800",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "rejected":
        return AlertCircle;
      case "success":
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  const styles = getStyles();
  const Icon = getIcon();

  return (
    <div className="w-full mt-4 sm:mt-6 px-4 sm:px-0 sm:max-w-xl mx-auto">
      <div
        className={`p-4 sm:p-5 rounded-lg sm:rounded-xl border-2 shadow-sm ${styles.container}`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
          <div className={`rounded-full p-2 shrink-0 ${styles.icon}`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="space-y-2 sm:space-y-3">
              <div>
                <h4
                  className={`text-base sm:text-lg font-semibold ${styles.title}`}
                >
                  {title}
                </h4>
                {message && (
                  <p
                    className={`mt-1.5 sm:mt-2 text-sm sm:text-base ${styles.message}`}
                  >
                    {message}
                  </p>
                )}
              </div>

              {steps && (
                <div className="space-y-1.5">
                  <p className={`text-sm font-medium ${styles.message}`}>
                    Please bring the following:
                  </p>
                  <ul
                    className={`text-sm ${styles.message} list-disc pl-4 space-y-1`}
                  >
                    {steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {reminder && (
                <div className={`pt-2 border-t ${styles.reminder}`}>
                  <p className="text-xs sm:text-sm">{reminder}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
