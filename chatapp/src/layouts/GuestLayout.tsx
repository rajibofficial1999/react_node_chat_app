import { Navigate, Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getLoggedInUser } from "@/actions/users";
import PageLoader from "@/components/PageLoader";

const GuestLayout = () => {
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getLoggedInUser,
    retry: false,
  });

  if (!isLoading && me) {
    return <Navigate to="/chat" replace />;
  }

  if (isLoading) {
    return <PageLoader />;
  }
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default GuestLayout;
