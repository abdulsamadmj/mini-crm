import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "./ui/badge";
import { Client } from "@/api/clients";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function ClientProfile(user: Client) {
  return (
    <ScrollArea>
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <div className="flex flex-row items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={user.picture.large}
                alt={`${user.name.first} ${user.name.last}`}
              />
              <AvatarFallback>
                {user.name.first[0]}
                {user.name.last[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-2xl">
                {user.name.first} {user.name.last}
              </p>
              <Badge
                variant={user.status === "active" ? "default" : "destructive"}
              >
                {user.status}
              </Badge>
            </div>
          </div>
          <div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm">{user.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm">
                  {user.location.city}, {user.location.country}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm">{user.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
