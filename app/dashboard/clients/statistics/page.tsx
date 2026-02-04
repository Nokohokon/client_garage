'use client'
import { Hourglass, UserRoundX, HandCoins, Mail, Kanban } from "lucide-react";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { Avatar } from "@heroui/react";
import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from "@mui/x-charts";
import Link from "next/link";


interface TopClient {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'LEAD' | 'INACTIVE' | 'ARCHIVED';
  totalProjects: number;
  totalRevenue: number;
}


export default function ClientStats () {
    
  const topClients : TopClient[] = [
    {
      id: '1',
      name: 'Max Mustermann',
      email: 'max@mustermann.de',
      status: 'ACTIVE',
      totalProjects: 12,
      totalRevenue: 5000,
    },
    {
      id: '2',
      name: 'Erika Musterfrau',
      email: 'erika@musterfrau.de',
      status: 'LEAD',
      totalProjects: 8,
      totalRevenue: 3000,
    },
    {
      id: '3',
      name: 'Hans Beispiel',
      email: 'hans@beispiel.de',
      status: 'INACTIVE',
      totalProjects: 5,
      totalRevenue: 1500,
    },
  ];


    return (
    <div className="mx-1 flex flex-col gap-4">
      
      
        {/* ===== Stats ===== */}
        <div className="flex md:flex-row flex-col gap-4">
          <StatCard label="Alle Kunden" value={5} icon={<UsersIcon className='w-8 h-8 text-primary mr-2'/>} color="blue" />
          <StatCard label="Aktive Kunden" value={5} icon={<UsersIcon className='w-8 h-8 text-secondary mr-2'/>} color="green" />
          <StatCard label="Wartende Kunden" value={5} icon={<Hourglass className='w-8 h-8 text-warning mr-2'/>} color="yellow" />
          <StatCard label="Inaktive Kunden" value={5} icon={<UserRoundX className='w-8 h-8 text-danger mr-2'/>} color="red" />
        </div>

        { /* Top Customers List */}
        <div className="flex flex-col gap-2 rounded-lg bg-card hover:bg-card-hover p-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-txt-main">Top Kunden</h2>
            <Link href="/dashboard/clients/statistics/top-clients" className="text-sm text-primary hover:underline">Alle ansehen</Link>
          </div>
          <div className="bg-card-nested hover:bg-card-nested-hover p-4 flex flex-row justify-around rounded-sm">
            {topClients.map((client) => 
              <div key={client.id} className="flex-1 flex flex-col items-center justify-center border-r last:border-r-0">
                <div className="flex flex-row items-center gap-2">
                  <Avatar>
                    {client.name.charAt(0)}
                  </Avatar>
                  <div className="flex flex-col justify-start ">
                    <span className="text-lg font-medium text-txt-main flex items-center">{client.name}</span>
                    <span className="text-txt-muted text-sm flex items-center gap-1" >{client.email}</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-col items-start justify-start">
                  <span className="text-sm text-txt-muted flex items-center justify-start"><Kanban className="w-4 h-4 mr-1"/> Projekte: {client.totalProjects}</span>
                  <span className="text-sm text-txt-muted flex items-center justify-start"><HandCoins className="w-4 h-4 mr-1"/> Umsatz: €{client.totalRevenue}</span>
                </div> 
            </div>
            )}
          </div>
        </div>
        
        { /* ===== Charts ===== */}
        <div className="flex md:flex-row flex-col gap-4 items-stretch w-full">
            <div className="flex-1 flex items-center justify-center rounded-lg bg-card hover:bg-card-hover p-2 min-w-0" style={{height: 340, minWidth: 0}}>
              <LineChart
                height={300}
                width={400}
                series={[
                  {
                    data: [3, 6, 4, 8, 12, 15, 18],
                    label: 'Anzahl an Klienten',
                    curve: 'monotoneX',
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'point',
                    data: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul'],
                  },
                ]}
                grid={{ vertical: true, horizontal: true }}
                sx={{
                  "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                    strokeWidth:"0.4",
                    fill:"var(--color-txt-main)",
                  },
                  "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                    strokeWidth:"0.4",
                    fill:"var(--color-txt-main)",
                  },
                  "& .MuiChartsLegend-root .MuiChartsLegend-itemLabel":{
                    fill:"var(--color-txt-main)",
                  },    
                }}
                slotProps={{
                  legend: {
                    sx: {
                      color: 'var(--color-txt-main)',
                    }
                  }
                }}
              />
            </div>
            <div className="flex-1 flex items-center rounded-lg justify-center bg-card hover:bg-card-hover p-2 min-w-0" style={{height: 340, minWidth: 0}}>
              <PieChart
                height={300}
                width={400}
                series={[
                  {
                    data: [
                      { id: 0, value: 42, label: 'Aktiv' },
                      { id: 1, value: 15, label: 'Wartend' },
                      { id: 2, value: 8, label: 'Inaktiv' },
                      { id: 3, value: 5, label: 'Archiviert' },
                    ],
                    innerRadius: 60,
                    outerRadius: 100,
                    paddingAngle: 4,
                  },
                ]}
                slotProps={{
                  legend: {
                    sx: {
                      color: 'var(--color-txt-main)',
                    }
                  }
                }}
              />
            </div>
        </div>




      </div>
    )
}


function StatCard({
  label,
  value,
  icon,
  color
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-between bg-card hover:bg-card-hover p-4 rounded-lg">
      <div className="flex items-center gap-2 text-txt-muted">
        {icon}
        {label}
      </div>
      <span className={`text-txt-main rounded-xl px-2 ${color === 'blue' ? 'bg-info-hover' : color === 'green' ? 'bg-success-hover' : color === 'red' ? 'bg-danger-hover' : 'bg-warning-hover'} font-semibold`}>
        {value}
      </span>
    </div>
  );
}
