'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useClientPageStore } from '@/store/clientPageStore';
import { clientFormState, projectAddFormState } from '@/store/createForm';
import { useIsOpen } from '@/store/open';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { Hourglass, UserRoundX, Plus, MoreVertical, RefreshCcwDot, Download, Table, LayoutPanelLeft, Settings, Mail, Trash, Kanban } from 'lucide-react';
import {
  Button,
  Select,
  ListBox,
  SearchField,
  Kbd,
  Modal,
  TextField,
  Label,
  Input,
  Dropdown,
  Separator,
  Description,
  Header
} from '@heroui/react';
import { ClientType, ClientStatus } from '@/lib/types';


type ChoiceType = ClientType | 'ALL';
type ChoiceStatus = ClientStatus | 'ALL';
type type = "success" | "warning" | "danger"

const choiceTypeOptions = [
  { value: 'ALL', label: 'Alle' },
  { value: 'person', label: 'Privat' },
  { value: 'organization', label: 'Geschäftlich' },
];

const choiceStatusOptions = [
  { value: 'ALL', label: 'Alle' },
  { value: 'ACTIVE', label: 'Aktiv' },
  { value: 'LEAD', label: 'Wartend' },
  { value: 'INACTIVE', label: 'Inaktiv' },
];

export default function ClientsPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const isTypeOpen = useIsOpen((s) => s.isTypeOpen);
  const setIsTypeOpen = useIsOpen((s) => s.setIsTypeOpen);
  const isStatusOpen = useIsOpen((s) => s.isStatusOpen);
  const setIsStatusOpen = useIsOpen((s) => s.setIsStatusOpen);
  const isAddClientOpen = useIsOpen((s) => s.isAddClientOpen);
  const setIsAddClientOpen = useIsOpen((s) => s.setIsAddClientOpen);
  const name = clientFormState((s) => s.name)
  const email = clientFormState((s) => s.email)
  const {setEmail, setName, resetForm} = clientFormState()
  const project = projectAddFormState((s) => s.name)
  const {setName: setProjectName, resetForm: resetProjectForm} = projectAddFormState()

  const {
    clients,
    counts,
    search,
    status,
    type,
    page,
    pageSize,
    total,
    setClients,
    setCounts,
    setTotal,
    setLoading,
    setError,
    setSearch,
    setStatus,
    setType,
  } = useClientPageStore();

  // =====================
  // Fetch Clients
  // =====================
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (search) params.set('search', search);
        if (status !== 'ALL') params.set('status', status);
        if (type !== 'ALL') params.set('type', type);

        params.set('page', page.toString());
        params.set('pageSize', pageSize.toString());

        const res = await fetch(`/api/dashboard/clients?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch clients');

        const data = await res.json();
        setClients(data.clients);
        setCounts(data.counts);
        setTotal(data.total);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [search, status, type, page, pageSize]);

  // =====================
  // Keyboard Shortcut
  // =====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'S') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch('/api/dashboard/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email
      }),
    });
    console.log(response)
    if (response.ok) {
      const newClient = await response.json();
      // newClient is an object with { status, client }
      if (newClient.client) {
        setClients([newClient.client, ...clients]);
        setTotal(total + 1);
        setCounts({
          ...counts,
          total: counts.total + 1,
          active: counts.active + 1,
        });
      } else {
        // handle duplicate or error case
        setError('Client existiert bereits oder konnte nicht erstellt werden.');
      }
    } else {
      console.error('Failed to create client');
    }
  }


  async function deleteClient(clientId: string) {
    const response = await fetch(`/api/dashboard/clients?clientId=${clientId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setClients(clients.filter(client => client.id !== clientId));
      setTotal(total - 1);
      // Update counts accordingly (this is a simplified example)
      setCounts({
        ...counts,
        total: counts.total - 1,
      });
    } else {
      console.error('Failed to delete client');
    }
  }



  return (
    <div className="mx-1 flex flex-col gap-4">
      
      
      {/* ===== Stats ===== */}
      <div className="flex gap-4">
        <StatCard label="Alle Klienten" value={counts.total} icon={<UsersIcon className='w-8 h-8 text-primary mr-2'/>} color="blue" />
        <StatCard label="Aktive Klienten" value={counts.active} icon={<UsersIcon className='w-8 h-8 text-secondary mr-2'/>} color="green" />
        <StatCard label="Wartende Klienten" value={counts.lead} icon={<Hourglass className='w-8 h-8 text-warning mr-2'/>} color="yellow" />
        <StatCard label="Inaktive Klienten" value={counts.inactive} icon={<UserRoundX className='w-8 h-8 text-danger mr-2'/>} color="red" />
      </div>

      {/* ===== Filters ===== */}
      <div className="flex items-center justify-between gap-4 bg-card p-2 rounded-lg">
        {/* Type */}
        <Select
          className="w-[256px]"
          value={type}
          isOpen={isTypeOpen}
          onOpenChange={setIsTypeOpen}
          onChange={(v) => setType(v as ChoiceType)}
        >
          <Select.Trigger className="bg-card-nested hover:bg-card-nested-hover border border-border text-txt-main">
            Typ: {type === 'ALL' ? 'Alle' : type === 'person' ? 'Privat' : 'Geschäftlich'}
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox className="bg-card-nested text-txt-muted border border-border">
              {choiceTypeOptions.map((o) => (
                <ListBox.Item key={o.value} id={o.value} className="hover:text-txt-inv">
                  {o.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {/* Status */}
        <Select
          className="w-[256px]"
          value={status}
          isOpen={isStatusOpen}
          onOpenChange={setIsStatusOpen}
          onChange={(v) => setStatus(v as ChoiceStatus)}
        >
          <Select.Trigger className="bg-card-nested hover:bg-card-nested-hover border border-border text-txt-main">
            Status: {status === 'ALL' ? 'Alle' : status}
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox className="bg-card-nested text-txt-muted border border-border">
              {choiceStatusOptions.map((o) => (
                <ListBox.Item key={o.value} id={o.value} className="hover:text-txt-inv">
                  {o.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {/* Search */}
        <SearchField value={search} onChange={setSearch}>
          <SearchField.Group className="bg-card-nested hover:bg-card-nested-hover border border-border text-txt-main">
            <SearchField.SearchIcon />
            <SearchField.Input ref={inputRef} placeholder="Suche Klienten…" />
            <SearchField.ClearButton />
            <Kbd className="bg-card text-txt-muted mr-2">
              <Kbd.Abbr keyValue="shift" /> S
            </Kbd>
          </SearchField.Group>
        </SearchField>
        <Modal>
            <Button className="bg-primary text-primary-fg hover:bg-primary-hover">
                <Plus /> Klienten erstellen
            </Button>
            <Modal.Backdrop isDismissable={false}>
                <Modal.Container placement="auto">
                    <Modal.Dialog className="bg-card sm:max-w-lg">
                        <Modal.CloseTrigger className="bg-card-nested hover:bg-card-nested-hover text-tertiary-fg" />
                        <Modal.Header>
                            <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                                <Mail className="size-5" />
                            </Modal.Icon>
                            <Modal.Heading className="text-txt-main">Klienten erstellen</Modal.Heading>
                            <p className="mt-1.5 text-sm leading-5 text-txt-muted">
                                Initialisiere deinen Klienten mit Name und Email.
                            </p>
                        </Modal.Header>
                        <Modal.Body className="p-6">
                            <form className="flex flex-col gap-4" onSubmit={createClient}>
                                <TextField className="w-full" name="name" type="text" isRequired>
                                    <Label>Klientenname</Label>
                                    <Input 
                                        placeholder="z.B. Muster GmbH" 
                                        className="bg-tertiary text-txt-muted" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                    />
                                </TextField>

                                <div className="flex gap-3">
                                    <TextField className="flex-1" name="email" type="email">
                                        <Label>E-Mail</Label>
                                        <Input 
                                            placeholder="info@muster-gmbh.de" 
                                            className="bg-tertiary text-txt-muted" 
                                            value={email || ""} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                        />
                                    </TextField>

                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="button" variant="secondary" className="flex-1" slot="close" onPress={() => resetForm()} >
                                        Abbrechen
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-1 bg-primary text-primary-fg hover:bg-primary-hover"
                                        slot="close"
                                    >
                                        Erstellen
                                    </Button>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
      </div>

      {/* ===== Table ===== */}
      <div className="bg-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-card-nested border-b border-border">
            <tr>
              <th className="text-left p-4 text-txt-muted font-medium">Name</th>
              <th className="text-left p-4 text-txt-muted font-medium">Typ</th>
              <th className="text-left p-4 text-txt-muted font-medium">tus</th>
              <th className="text-left p-4 text-txt-muted font-medium">Letzter Kontakt</th>
              <th className="text-left p-4 text-txt-muted font-medium">Verantwortlich</th>
              <th className="text-right p-4 text-txt-muted font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border hover:bg-card-hover">
                <td className="p-4">
                  <Link href={`/dashboard/clients/${client.id}`}  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-txt-main font-medium">{client.name}</div>
                        {client.email && <div className="text-txt-muted text-sm">{client.email}</div>}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-txt-muted">
                    {client.type === 'person' ? (
                      <>
                        <UsersIcon className="w-4 h-4" />
                        Person
                      </>
                    ) : (
                      <>
                        <UsersIcon className="w-4 h-4" />
                        Organisation
                      </>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <Chip
                    type={
                      client.status === 'ACTIVE'
                        ? 'success'
                        : client.status === 'LEAD'
                        ? 'warning'
                        : 'danger'
                    }
                    label = {client.status === 'ACTIVE' ? 'Aktiv' : client.status === 'LEAD' ? 'Wartend' : 'Inaktiv'}
                    />
                </td>
                <td className="p-4 text-txt-muted">
                  {client.lastContactAt
                    ? new Date(client.lastContactAt).toLocaleDateString('de-DE')
                    : '—'}
                </td>
                <td className="p-4 text-txt-muted">
                  {/* Hier könntest du User-Daten anzeigen wenn verfügbar */}
                  —
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Dropdown>
                      <Dropdown.Trigger>
                        <MoreVertical className="w-5 h-5 text-txt-muted hover:text-txt-main" />
                      </Dropdown.Trigger>
                      <Dropdown.Popover>
                        <Dropdown.Menu className='bg-card-nested hover:text-danger'>
                          <Dropdown.Item className='flex justify-center text-txt-main hover:text-txt-inv'>
                            Statistiken
                            <Description />
                            <Dropdown.ItemIndicator />
                          </Dropdown.Item>
                          <Separator />
                          <Dropdown.Section>
                            <Header />
                            <Dropdown.Item className='text-txt-main hover:text-txt-inv'>
                              <Link href={`${client.id}/projects`} className='flex items-center gap-2'>
                              <Kanban className="w-4 text-txt-muted hover:text-txt-main h-4 mr-2" />
                              Projekte anzeigen
                              </Link>
                            </Dropdown.Item>
                            <Dropdown.Item className='text-txt-main hover:text-txt-inv' onPress={()=> deleteClient(client.id)}>
                              <Trash className="w-4 text-danger hover:text-danger-hover h-4 mr-2" />
                              Klienten löschen
                            </Dropdown.Item>
                          </Dropdown.Section>
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={6} className="p-4 text-txt-muted text-sm">
                <div className="flex w-full justify-between items-center">
                  <span className="flex flex-row gap-2 items-center">
                    <span>{clients.length}</span>
                    <span>von</span>
                    <span>{total}</span>
                    <span>Klienten angezeigt.</span>
                  </span>
                  <div className="flex items-center gap-4 justify-end w-full">
                    <button
                      className="px-3 py-1 bg-card-nested hover:bg-card-nested-hover rounded-lg"
                      disabled={page <= 1}
                      onClick={() => {
                        if (page > 1) {
                          useClientPageStore.getState().setPage(page - 1);
                        }
                      }}
                    >
                      Vorherige
                    </button>
                    <span className="flex flex-row items-center gap-2">
                      <span>Seite</span>
                      <input
                        type="number"
                        value={page}
                        onChange={(e) => {
                          const newPage = Math.min(Math.max(1, Number(e.target.value)), Math.ceil(total / pageSize));
                          useClientPageStore.getState().setPage(newPage);
                        }}
                        className="w-12 text-center rounded-lg border border-card-nested"
                      />
                      <span>von</span>
                      <span>{Math.ceil(total / pageSize)}</span>
                    </span>
                    <button
                      className="px-3 py-1 bg-card-nested hover:bg-card-nested-hover rounded-lg"
                      disabled={page >= Math.ceil(total / pageSize)}
                      onClick={() => {
                        if (page < Math.ceil(total / pageSize)) {
                          useClientPageStore.getState().setPage(page + 1);
                        }
                      }}
                    >
                      Nächste
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-12 text-txt-muted">
            Keine Klienten gefunden
          </div>
        )}
      </div>
    </div>
  );
}

// =====================
// Stat Card
// =====================
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


function Chip({
  label,
  type
} : {
  label: string;
  type: type;
}) {
  let bg = '';
  let hover = '';
  switch (type) {
    case 'success':
      bg = 'bg-success';
      hover = 'hover:bg-success-hover';
      break;
    case 'warning':
      bg = 'bg-warning';
      hover = 'hover:bg-warning-hover';
      break;
    case 'danger':
      bg = 'bg-danger';
      hover = 'hover:bg-danger-hover';
      break;
    default:
      bg = 'bg-gray-300';
      hover = 'hover:bg-gray-400';
  }
  return (
    <div className={`${bg} ${hover} text-txt-main p-2 flex items-center justify-center rounded-lg`}>
      {label}
    </div>
  )
}