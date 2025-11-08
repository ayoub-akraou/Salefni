import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";

export const AppDataContext = createContext();

export default function AppDataContextProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [creditTypes, setCreditTypes] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [simulations, setSimulations] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [settings, setSettings] = useState([]);

    useEffect(() => {
        const api = axios.create({
          baseURL: "http://localhost:3001",
        });
        (async function loadData() {
            setLoading(true);
            try {
                const res = await api.get("/data");
                setCreditTypes(res.data.creditTypes);
                setEmploymentTypes(res.data.employmentTypes);
                setJobs(res.data.jobs);
                setApplications(res.data.applications);
                setSimulations(res.data.simulations);
                setNotifications(res.data.notifications);
                setAdmins(res.data.admins);
                setSettings(res.data.settings);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })()
    }, []);

    return (
      <AppDataContext.Provider
        value={{
          creditTypes,
          setCreditTypes,
          employmentTypes,
          setEmploymentTypes,
          jobs,
          setJobs,
          applications,
          setApplications,
          simulations,
          setSimulations,
          notifications,
          setNotifications,
          admins,
          setAdmins,
          settings,
          setSettings,
          loading,
          setLoading,
          error,
          setError,
        }}
      >
        {children}
      </AppDataContext.Provider>
    );
}

export function useAppData() {
    return useContext(AppDataContext);
}