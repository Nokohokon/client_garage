"use client";

import {Button, Label, ListBox, Select, Avatar, AvatarFallback} from "@heroui/react";
import { useIsOpen } from "@/store/open";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Check,  } from "lucide-react";


export function OrganisationSelect() {
    const isOpen = useIsOpen((state) => state.isOpen);
    const setIsOpen = useIsOpen((state) => state.setIsOpen);
    const { data: session } = authClient.useSession();
    const { data: organisations } = authClient.useListOrganizations();



  return (
    <div className="space-y-4">
      <Select
        className="w-[256px]"
        isOpen={isOpen}
        placeholder="Bitte Organisation wählen"
        onOpenChange={setIsOpen}
      >
        <Label>Organisation wechseln</Label>
        <Select.Trigger className="bg-card-nested hover:bg-card-nested-hover border border-border">
          <div className="flex justify-between gap-4 items-center">
              <Avatar/>
              <div className="flex flex-col justify-center items-start">
                <h3 className="text-xl tracking-tight text-txt-main">
                  {authClient.useActiveOrganization.name || "MusterGMBH"}
                </h3>
                <p className="text-md  rounded-lg text-txt-muted">{authClient.useActiveMemberRole.name || "Admin"}</p>
              </div>
          </div>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {organisations && organisations.map((org) => (
              <ListBox.Item key={org.id} id={org.id} textValue={org.name}>
                {org.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}