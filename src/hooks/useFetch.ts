import { useEffect, useState } from "react";

/**
 * Custom hook to fetch data from a given URL.
 * It handles loading, error, and data states.
 *
 * @param url The URL from which to fetch data.
 * @returns The fetched data, loading status, and error message.
 */
export const useFetch = (url: string) => {
  const [data, setData] = useState<any>(null); // Store the fetched data
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    /**
     * Fetches the data from the API and handles possible errors.
     */
    const fetchData = async () => {
      try {
        const response = await fetch(url);

        // Check if response is successful
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        // Check if the response is JSON
        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response');
        }

        // Parse and store the JSON data
        const result = await response.json();
        setData(result);
      } catch (error: any) {
        setError(error.message); // Store error message if any
      } finally {
        setLoading(false); // Set loading to false once done
      }
    };

    fetchData(); // Call fetchData when URL changes
  }, [url]);

  return { data, loading, error }; // Return the data, loading, and error states
};
