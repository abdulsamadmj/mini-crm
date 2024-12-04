import axios from "axios";

export interface Client {
  id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  status: "active" | "inactive";
  location: {
    city: string;
    country: string;
  };
  picture: {
    thumbnail: string;
    large: string;
  };
}

export const fetchClients = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{
  clients: Client[];
  total: number;
}> => {
  try {
    if (!navigator.onLine) {
      throw new Error("Offline");
    }
    
    const response = await axios.get("https://randomuser.me/api/", {
      params: {
        page,
        results: pageSize,
        seed: "crm-demo",
      },
    });

    // Transform random user data to our Client type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clients: Client[] = response.data.results.map((user: any) => ({
      id: user.login.uuid,
      name: {
        first: user.name.first,
        last: user.name.last,
      },
      email: user.email,
      phone: user.phone,
      status: Math.random() > 0.5 ? "active" : "inactive",
      location: {
        city: user.location.city,
        country: user.location.country,
      },
      picture: {
        thumbnail: user.picture.thumbnail,
        large: user.picture.large,
      },
    }));

    return {
      clients,
      total: response.data.info.results,
    };
  } catch (error) {
    console.error("Error in fetchClients:", error);
    throw new Error("Failed to fetch clients");
  }
};
