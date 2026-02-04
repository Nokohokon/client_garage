'use client'
import { Hourglass, UserRoundX, HandCoins, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { Avatar, Select, ListBox } from "@heroui/react";
import * as React from 'react';
import { LineChart, PieChart } from '@mui/x-charts';
import Link from "next/link";
import { useEffect, useState } from 'react';

interface TopClient {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'LEAD' | 'INACTIVE' | 'ARCHIVED';
  totalProjects: number;
  totalRevenue: number;
}

interface LiveMetrics {
  clients: {
    total: number;
    active: number;
    new_24h: number;
  };
  tasks: {
    total: number;
    completed: number;
    revenue_24h: string;
  };
  activityLastHour: number;
}

interface Metric {
  timestamp: string;
  total_clients: number;
  active_clients: number;
  lead_clients: number;
  inactive_clients: number;
  clients_added: number;
  clients_lost: number;
  clients_activated: number;
  total_revenue: string;
  completed_tasks: number;
  clientGrowthRate: string;
  revenueGrowthRate: string;
}

export default function ClientStats() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [granularity, setGranularity] = useState<'hour' | 'day'>('day');
  const [hours, setHours] = useState(168); // 7 Tage default
  const [loading, setLoading] = useState(true);

  // Top Clients (dummy data - später aus API holen)
  const topClients: TopClient[] = [
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

  // Lade historische Metriken
  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/metrics?granularity=${granularity}&hours=${hours}`)
      .then(r => r.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [granularity, hours]);

  // Live Metriken alle 30 Sekunden
  useEffect(() => {
    const fetchLive = () => {
      fetch('/api/dashboard/metrics?live=true')
        .then(r => r.json())
        .then(setLiveMetrics)
        .catch(console.error);
    };

    fetchLive(); // Initial
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, []);

  const latestMetric = metrics[metrics.length - 1];

  return (
    <div className="mx-1 flex flex-col gap-4">
      
      {/* Live Stats Karten */}
      <div className="flex md:flex-row flex-col gap-4">
        <StatCard 
          label="Alle Kunden" 
          value={liveMetrics?.clients.total || 0} 
          icon={<UsersIcon className='w-8 h-8 text-primary mr-2'/>} 
          color="blue" 
        />
        <StatCard 
          label="Aktive Kunden" 
          value={liveMetrics?.clients.active || 0} 
          icon={<UsersIcon className='w-8 h-8 text-secondary mr-2'/>} 
          color="green" 
        />
        <StatCard 
          label="Neue (24h)" 
          value={liveMetrics?.clients.new_24h || 0} 
          icon={<TrendingUp className='w-8 h-8 text-info mr-2'/>} 
          color="blue" 
        />
        <StatCard 
          label="Aktivität (1h)" 
          value={liveMetrics?.activityLastHour || 0} 
          icon={<Activity className='w-8 h-8 text-warning mr-2'/>} 
          color="yellow" 
        />
      </div>

      {/* Growth Rate Karten */}
      {latestMetric && (
        <div className="flex md:flex-row flex-col gap-4">
          <GrowthCard 
            label="Client Growth"
            value={parseFloat(latestMetric.clientGrowthRate)}
            period={granularity === 'hour' ? 'seit letzter Stunde' : 'seit gestern'}
          />
          <GrowthCard 
            label="Revenue Growth"
            value={parseFloat(latestMetric.revenueGrowthRate)}
            period={granularity === 'hour' ? 'seit letzter Stunde' : 'seit gestern'}
          />
          <div className="flex-1 flex items-center justify-between bg-card hover:bg-card-hover p-4 rounded-lg">
            <div className="flex items-center gap-2 text-txt-muted">
              <HandCoins className="w-8 h-8 text-success mr-2"/>
              Revenue (24h)
            </div>
            <span className="text-txt-main rounded-xl px-2 bg-success-hover font-semibold text-xl">
              €{parseFloat(liveMetrics?.tasks.revenue_24h || '0').toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg">
        <div className="flex gap-2 items-center">
          <label className="text-txt-muted text-sm">Ansicht:</label>
          <Select 
            className="w-[150px]"
            value={granularity} 
            onChange={(v) => setGranularity(v as 'hour' | 'day')}
          >
            <Select.Trigger className="bg-card-nested hover:bg-card-nested-hover border border-border text-txt-main">
              {granularity === 'hour' ? 'Stündlich' : 'Täglich'}
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox className="bg-card-nested text-txt-muted border border-border">
                <ListBox.Item id="hour">Stündlich</ListBox.Item>
                <ListBox.Item id="day">Täglich</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-txt-muted text-sm">Zeitraum:</label>
          <Select 
            className="w-[150px]"
            value={hours.toString()} 
            onChange={(v) => setHours(Number(v))}
          >
            <Select.Trigger className="bg-card-nested hover:bg-card-nested-hover border border-border text-txt-main">
              {hours < 48 ? `${hours} Stunden` : `${hours / 24} Tage`}
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox className="bg-card-nested text-txt-muted border border-border">
                <ListBox.Item id="24">24 Stunden</ListBox.Item>
                <ListBox.Item id="72">3 Tage</ListBox.Item>
                <ListBox.Item id="168">7 Tage</ListBox.Item>
                <ListBox.Item id="720">30 Tage</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {/* Top Customers List */}
      <div className="flex flex-col gap-2 rounded-lg bg-card hover:bg-card-hover p-4 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-txt-main">Top Kunden</h2>
          <Link href="/dashboard/clients/statistics/top-clients" className="text-sm text-primary hover:underline">
            Alle ansehen
          </Link>
        </div>
        <div className="bg-card-nested hover:bg-card-nested-hover p-4 flex flex-row justify-around rounded-sm">
          {topClients.map((client) => 
            <div key={client.id} className="flex-1 flex flex-col items-center justify-center border-r last:border-r-0">
              <div className="flex flex-row items-center gap-2">
                <Avatar>
                  {client.name.charAt(0)}
                </Avatar>
                <div className="flex flex-col justify-start">
                  <span className="text-lg font-medium text-txt-main flex items-center">{client.name}</span>
                  <span className="text-txt-muted text-sm flex items-center gap-1">{client.email}</span>
                </div>
              </div>
              <div className="mt-2 flex flex-col items-start justify-start">
                <span className="text-sm text-txt-muted flex items-center justify-start">
                  Projekte: {client.totalProjects}
                </span>
                <span className="text-sm text-txt-muted flex items-center justify-start">
                  <HandCoins className="w-4 h-4 mr-1"/> Umsatz: €{client.totalRevenue}
                </span>
              </div> 
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="text-center py-12 text-txt-muted">Lade Daten...</div>
      ) : (
        <div className="flex md:flex-row flex-col gap-4 items-stretch w-full">
          {/* Client Growth Chart */}
          <div className="flex-1 flex flex-col rounded-lg bg-card hover:bg-card-hover p-4 min-w-0" style={{minHeight: 380}}>
            <h3 className="text-lg font-semibold text-txt-main mb-2">Klienten-Entwicklung</h3>
            <LineChart
              height={300}
              series={[
                {
                  data: metrics.map(m => m.total_clients),
                  label: 'Gesamt',
                  curve: 'monotoneX',
                },
                {
                  data: metrics.map(m => m.active_clients),
                  label: 'Aktiv',
                  curve: 'monotoneX',
                },
                {
                  data: metrics.map(m => m.lead_clients),
                  label: 'Wartend',
                  curve: 'monotoneX',
                },
              ]}
              xAxis={[{
                scaleType: 'time',
                data: metrics.map(m => new Date(m.timestamp)),
              }]}
              grid={{ vertical: true, horizontal: true }}
              sx={{
                "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
                  strokeWidth: "0.4",
                  fill: "var(--color-txt-main)",
                },
                "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
                  strokeWidth: "0.4",
                  fill: "var(--color-txt-main)",
                },
                "& .MuiChartsLegend-root .MuiChartsLegend-itemLabel": {
                  fill: "var(--color-txt-main)",
                },
              }}
              slotProps={{
                legend: {
                  sx: { color: 'var(--color-txt-main)' }
                }
              }}
            />
          </div>

          {/* Revenue Chart */}
          <div className="flex-1 flex flex-col rounded-lg bg-card hover:bg-card-hover p-4 min-w-0" style={{minHeight: 380}}>
            <h3 className="text-lg font-semibold text-txt-main mb-2">Umsatz-Entwicklung</h3>
            <LineChart
              height={300}
              series={[{
                data: metrics.map(m => parseFloat(m.total_revenue)),
                label: 'Umsatz (€)',
                curve: 'monotoneX',
              }]}
              xAxis={[{
                scaleType: 'time',
                data: metrics.map(m => new Date(m.timestamp)),
              }]}
              grid={{ vertical: true, horizontal: true }}
              sx={{
                "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
                  strokeWidth: "0.4",
                  fill: "var(--color-txt-main)",
                },
                "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
                  strokeWidth: "0.4",
                  fill: "var(--color-txt-main)",
                },
                "& .MuiChartsLegend-root .MuiChartsLegend-itemLabel": {
                  fill: "var(--color-txt-main)",
                },
              }}
              slotProps={{
                legend: {
                  sx: { color: 'var(--color-txt-main)' }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Status Distribution Pie Chart */}
      {latestMetric && (
        <div className="flex-1 flex flex-col items-center rounded-lg justify-center bg-card hover:bg-card-hover p-4 min-w-0" style={{minHeight: 380}}>
          <h3 className="text-lg font-semibold text-txt-main mb-2">Status-Verteilung</h3>
          <PieChart
            height={300}
            width={400}
            series={[{
              data: [
                { id: 0, value: latestMetric.active_clients, label: 'Aktiv' },
                { id: 1, value: latestMetric.lead_clients, label: 'Wartend' },
                { id: 2, value: latestMetric.inactive_clients, label: 'Inaktiv' },
              ],
              innerRadius: 60,
              outerRadius: 100,
              paddingAngle: 4,
            }]}
            slotProps={{
              legend: {
                sx: { color: 'var(--color-txt-main)' }
              }
            }}
          />
        </div>
      )}

      {/* Detaillierte Metriken */}
      {latestMetric && (
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <MetricCard label="Hinzugefügt" value={latestMetric.clients_added} color="success" />
          <MetricCard label="Verloren" value={latestMetric.clients_lost} color="danger" />
          <MetricCard label="Aktiviert" value={latestMetric.clients_activated} color="info" />
        </div>
      )}

    </div>
  );
}

// StatCard Component (wie vorher)
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
      <span className={`text-txt-main rounded-xl px-2 ${
        color === 'blue' ? 'bg-info-hover' : 
        color === 'green' ? 'bg-success-hover' : 
        color === 'red' ? 'bg-danger-hover' : 
        'bg-warning-hover'
      } font-semibold`}>
        {value}
      </span>
    </div>
  );
}

// Neue GrowthCard Component
function GrowthCard({
  label,
  value,
  period
}: {
  label: string;
  value: number;
  period: string;
}) {
  const isPositive = value >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isPositive ? 'text-success' : 'text-danger';
  const bgClass = isPositive ? 'bg-success-hover' : 'bg-danger-hover';

  return (
    <div className="flex-1 flex flex-col bg-card hover:bg-card-hover p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-txt-muted text-sm">{label}</span>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${colorClass}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </span>
      </div>
      <span className="text-txt-muted text-xs mt-1">{period}</span>
    </div>
  );
}

// Neue MetricCard Component
function MetricCard({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: 'success' | 'danger' | 'info';
}) {
  const colorClasses = {
    success: 'bg-success-hover text-success',
    danger: 'bg-danger-hover text-danger',
    info: 'bg-info-hover text-info',
  };

  return (
    <div className="flex items-center justify-between bg-card hover:bg-card-hover p-4 rounded-lg">
      <span className="text-txt-muted">{label}</span>
      <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  );
}