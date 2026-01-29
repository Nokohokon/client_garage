import { create } from "zustand";

interface data {
    allClients: [],
    activeClients: [],
    waitingClients: [],
    inactiveClients: [],
    recentClients: [],
    runningProjects: [],
    openTasks: [],
    currentTasks: [],
    monthlyRevenue:0,
    revenueOverview: [],
    latestActions: [],
    counts: {
        totalClients: number,
        activeClients: number,
        waitingClients: number
    }
}

interface dashboardData {
    data: data,
    setData: (data: data) => void,
}

export const dashboardStore = create<dashboardData>((set) => ({
    data: {
        allClients: [],
        activeClients: [],
        waitingClients: [],
        inactiveClients: [],
        recentClients: [],
        runningProjects: [],
        openTasks: [],
        currentTasks: [],
        monthlyRevenue:0,
        revenueOverview: [],
        latestActions: [],
        counts: {
            totalClients: 0,
            activeClients: 0,
            waitingClients: 0
        }
    },
    setData: (data: data) => set({data: data}),
}))