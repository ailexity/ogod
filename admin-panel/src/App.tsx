import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Download,
  Filter,
  IndianRupee,
  ListChecks,
  Loader2,
  LogOut,
  MapPin,
  Pause,
  Play,
  RefreshCcw,
  Search,
  ShieldCheck,
  Table2,
  Trash2,
  Users,
} from 'lucide-react';
import {
  api,
  type Category,
  type Lead,
  type LeadFilters,
  type ListingFilters,
  type Meta,
  type Trip,
  type TripStatus,
  type User,
} from './api/client';
import './styles/theme.css';
import './styles/app.css';

const TOKEN_KEY = 'ogod_admin_token';
const USER_KEY = 'ogod_admin_user';
const STATUS_OPTIONS: Array<TripStatus | 'all'> = ['all', 'live', 'paused', 'past', 'deleted'];

type ListingStatus = TripStatus | 'all';
type AdminListingFilters = Omit<ListingFilters, 'status'> & { status: ListingStatus };

type Session = {
  token: string;
  user: User;
};

type Tab = 'leads' | 'listings';

function readStoredSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userValue = localStorage.getItem(USER_KEY);
  if (!token || !userValue) return null;

  try {
    return { token, user: JSON.parse(userValue) as User };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function storeSession(session: Session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatMoney(value?: number) {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function userFrom(value?: User | string) {
  return value && typeof value === 'object' ? value : undefined;
}

function tripFrom(value?: Trip | string) {
  return value && typeof value === 'object' ? value : undefined;
}

function categoryLabel(categories: Category[], slug?: string) {
  if (!slug) return '-';
  return categories.find((category) => category.slug === slug)?.label || slug.replace(/-/g, ' ');
}

function App() {
  const [session, setSession] = useState<Session | null>(() => readStoredSession());
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = readStoredSession();
    if (!stored) {
      setChecking(false);
      return;
    }

    api
      .me(stored.token)
      .then(({ data }) => {
        if (data.user.role !== 'admin') {
          throw new Error('This account is not an admin.');
        }
        const next = { token: stored.token, user: data.user };
        storeSession(next);
        setSession(next);
      })
      .catch(() => {
        clearSession();
        setSession(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleAuthenticated = (next: Session) => {
    storeSession(next);
    setSession(next);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  if (checking) {
    return (
      <main className="login-screen">
        <div className="loading-state">
          <Loader2 className="spinner" aria-hidden="true" /> Checking session
        </div>
      </main>
    );
  }

  if (!session) {
    return <LoginView onAuthenticated={handleAuthenticated} />;
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
}

function LoginView({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.requestOtp(mobile);
      setOtpRequested(true);
      setDevCode(data.devCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.verifyOtp(mobile, code);
      if (data.user.role !== 'admin') {
        throw new Error('This account is not an admin. Seed ADMIN_MOBILE first, then log in.');
      }
      onAuthenticated({ token: data.token, user: data.user });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to verify OTP';
      setError(
        message.includes('Name is required')
          ? 'Admin account is not bootstrapped. Run npm run seed in backend with ADMIN_MOBILE set, then request a new OTP.'
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="brand-mark">O</div>
        <h1 id="login-title">Ogod Admin</h1>
        <p>Sign in with the bootstrapped admin mobile number.</p>

        {!otpRequested ? (
          <form onSubmit={requestOtp}>
            <div className="field">
              <label htmlFor="mobile">Mobile</label>
              <input
                id="mobile"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder="919999999999"
                required
              />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={18} /> : <ShieldCheck size={18} />}
              Request OTP
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            {devCode && (
              <p className="inline-note">
                Dev OTP <span className="code-value">{devCode}</span>
              </p>
            )}
            <div className="field">
              <label htmlFor="code">OTP</label>
              <input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="one-time-code"
                inputMode="numeric"
                required
              />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={18} /> : <ShieldCheck size={18} />}
              Verify
            </button>
            <button className="button" type="button" onClick={() => setOtpRequested(false)}>
              Change mobile
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('leads');
  const [categories, setCategories] = useState<Category[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadMeta, setLeadMeta] = useState<Meta | undefined>();
  const [leadFilters, setLeadFilters] = useState<LeadFilters>({ page: 1, limit: 50 });
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [listingFilters, setListingFilters] = useState<AdminListingFilters>({
    status: 'all',
    sort: 'recent',
    limit: 50,
    page: 1,
  });
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState('');

  const stats = useMemo(() => {
    return {
      leads: leadMeta?.total ?? leads.length,
      live: trips.filter((trip) => trip.status === 'live').length,
      paused: trips.filter((trip) => trip.status === 'paused').length,
      past: trips.filter((trip) => trip.status === 'past').length,
    };
  }, [leadMeta?.total, leads.length, trips]);

  const loadCategories = async () => {
    try {
      const { data } = await api.listCategories(session.token);
      setCategories(data.categories);
    } catch {
      setCategories([]);
    }
  };

  const loadLeads = async (filters = leadFilters) => {
    setLeadsLoading(true);
    setLeadsError('');
    try {
      const { data, meta } = await api.listLeads(session.token, filters);
      setLeads(data);
      setLeadMeta(meta);
    } catch (err) {
      setLeadsError(err instanceof Error ? err.message : 'Unable to load leads');
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadListings = async (filters = listingFilters) => {
    setListingsLoading(true);
    setListingsError('');
    try {
      const statusFilter = filters.status;
      const { status: _selectedStatus, ...sharedFilters } = filters;
      if (statusFilter === 'all') {
        const responses = await Promise.all(
          STATUS_OPTIONS.filter((status): status is TripStatus => status !== 'all').map((status) =>
            api.listTrips({ ...sharedFilters, status })
          )
        );
        const items = responses
          .flatMap((response) => response.data)
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setTrips(items);
      } else {
        const { data } = await api.listTrips({ ...sharedFilters, status: statusFilter });
        setTrips(data);
      }
    } catch (err) {
      setListingsError(err instanceof Error ? err.message : 'Unable to load listings');
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadLeads();
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLeadFilter = (key: keyof LeadFilters, value: string | number) => {
    setLeadFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? Number(value) : 1 }));
  };

  const updateListingFilter = (key: keyof AdminListingFilters, value: string | number) => {
    setListingFilters((current) => ({ ...current, [key]: value }));
  };

  const exportLeads = async () => {
    setExporting(true);
    setLeadsError('');
    try {
      const blob = await api.exportLeadsCsv(session.token, leadFilters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ogod-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setLeadsError(err instanceof Error ? err.message : 'Unable to export leads');
    } finally {
      setExporting(false);
    }
  };

  const setTripStatus = async (trip: Trip, status: 'paused' | 'live') => {
    setListingsError('');
    try {
      const response =
        status === 'paused'
          ? await api.pauseTrip(session.token, trip._id)
          : await api.resumeTrip(session.token, trip._id);
      setTrips((current) => current.map((item) => (item._id === trip._id ? response.data.trip : item)));
    } catch (err) {
      setListingsError(err instanceof Error ? err.message : 'Unable to update listing');
    }
  };

  const deleteTrip = async (trip: Trip) => {
    if (!window.confirm(`Delete listing "${trip.title}"?`)) return;
    setListingsError('');
    try {
      await api.deleteTrip(session.token, trip._id);
      setTrips((current) =>
        listingFilters.status === 'all'
          ? current.map((item) => (item._id === trip._id ? { ...item, status: 'deleted' } : item))
          : current.filter((item) => item._id !== trip._id)
      );
    } catch (err) {
      setListingsError(err instanceof Error ? err.message : 'Unable to delete listing');
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">O</div>
          <div>
            <h1>Ogod Admin</h1>
            <span>Leads and listings control room</span>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="user-pill" title={session.user.mobile}>
            <ShieldCheck size={16} />
            {session.user.name}
          </div>
          <button className="button" type="button" onClick={onLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </header>

      <div className="content">
        <section className="stats-grid" aria-label="Overview">
          <div className="metric accent">
            <span>Total leads</span>
            <strong>{stats.leads}</strong>
          </div>
          <div className="metric">
            <span>Live listings</span>
            <strong>{stats.live}</strong>
          </div>
          <div className="metric">
            <span>Paused</span>
            <strong>{stats.paused}</strong>
          </div>
          <div className="metric">
            <span>Past</span>
            <strong>{stats.past}</strong>
          </div>
        </section>

        <nav className="tabs" aria-label="Admin views">
          <button className={`tab-button ${tab === 'leads' ? 'active' : ''}`} onClick={() => setTab('leads')}>
            <Table2 size={18} />
            Leads
          </button>
          <button className={`tab-button ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
            <ListChecks size={18} />
            Listings
          </button>
        </nav>

        {tab === 'leads' ? (
          <LeadsPanel
            categories={categories}
            leads={leads}
            meta={leadMeta}
            filters={leadFilters}
            loading={leadsLoading}
            error={leadsError}
            exporting={exporting}
            onFilterChange={updateLeadFilter}
            onApply={() => loadLeads({ ...leadFilters, page: 1 })}
            onRefresh={() => loadLeads()}
            onExport={exportLeads}
            onPage={(page) => {
              const next = { ...leadFilters, page };
              setLeadFilters(next);
              loadLeads(next);
            }}
          />
        ) : (
          <ListingsPanel
            categories={categories}
            trips={trips}
            filters={listingFilters}
            loading={listingsLoading}
            error={listingsError}
            onFilterChange={updateListingFilter}
            onApply={() => loadListings()}
            onRefresh={() => loadListings()}
            onPause={(trip) => setTripStatus(trip, 'paused')}
            onResume={(trip) => setTripStatus(trip, 'live')}
            onDelete={deleteTrip}
          />
        )}
      </div>
    </main>
  );
}

type LeadsPanelProps = {
  categories: Category[];
  leads: Lead[];
  meta?: Meta;
  filters: LeadFilters;
  loading: boolean;
  error: string;
  exporting: boolean;
  onFilterChange: (key: keyof LeadFilters, value: string | number) => void;
  onApply: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onPage: (page: number) => void;
};

function LeadsPanel({
  categories,
  leads,
  meta,
  filters,
  loading,
  error,
  exporting,
  onFilterChange,
  onApply,
  onRefresh,
  onExport,
  onPage,
}: LeadsPanelProps) {
  return (
    <section className="panel" aria-labelledby="leads-title">
      <div className="panel-header">
        <div className="panel-title">
          <h2 id="leads-title">Lead Table</h2>
          <p>{meta ? `${meta.total} matching leads` : `${leads.length} leads loaded`}</p>
        </div>
        <div className="actions">
          <button className="button" onClick={onRefresh} type="button">
            <RefreshCcw size={18} />
            Refresh
          </button>
          <button className="button primary" onClick={onExport} type="button" disabled={exporting}>
            {exporting ? <Loader2 className="spinner" size={18} /> : <Download size={18} />}
            Export CSV
          </button>
        </div>
      </div>

      <div className="filter-grid">
        <div className="field">
          <label htmlFor="lead-from">From</label>
          <input
            id="lead-from"
            type="date"
            value={filters.from || ''}
            onChange={(event) => onFilterChange('from', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lead-to">To</label>
          <input
            id="lead-to"
            type="date"
            value={filters.to || ''}
            onChange={(event) => onFilterChange('to', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lead-destination">Destination</label>
          <input
            id="lead-destination"
            value={filters.destination || ''}
            onChange={(event) => onFilterChange('destination', event.target.value)}
            placeholder="Goa"
          />
        </div>
        <div className="field">
          <label htmlFor="lead-category">Category</label>
          <select
            id="lead-category"
            value={filters.category || ''}
            onChange={(event) => onFilterChange('category', event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="lead-trip">Trip ID</label>
          <input
            id="lead-trip"
            value={filters.tripId || ''}
            onChange={(event) => onFilterChange('tripId', event.target.value)}
            placeholder="ObjectId"
          />
        </div>
        <div className="filter-actions">
          <button className="button primary" onClick={onApply} type="button">
            <Filter size={18} />
            Apply
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <div className="loading-state">
          <Loader2 className="spinner" aria-hidden="true" /> Loading leads
        </div>
      ) : leads.length === 0 ? (
        <div className="empty-state">No leads found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Created</th>
                <th>Traveler</th>
                <th>Trip</th>
                <th>Category</th>
                <th>Destination</th>
                <th>Poster</th>
                <th>Requirements</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const trip = tripFrom(lead.tripId);
                const poster = userFrom(lead.posterId);
                return (
                  <tr key={lead._id}>
                    <td>{formatDateTime(lead.createdAt)}</td>
                    <td>
                      <div className="cell-title">
                        <strong>{lead.travelerName}</strong>
                        <span>{lead.travelerMobile}</span>
                      </div>
                    </td>
                    <td>{lead.tripTitle || trip?.title || '-'}</td>
                    <td>{categoryLabel(categories, trip?.category)}</td>
                    <td>{lead.destinationInterest || trip?.destination?.name || '-'}</td>
                    <td>
                      <div className="cell-title">
                        <strong>{poster?.organizationName || poster?.name || '-'}</strong>
                        <span>{poster?.mobile || ''}</span>
                      </div>
                    </td>
                    <td>{lead.requirements || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="pagination">
          <button className="button" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
            Previous
          </button>
          <span className="muted">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button className="button" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
            Next
          </button>
        </div>
      )}
    </section>
  );
}

type ListingsPanelProps = {
  categories: Category[];
  trips: Trip[];
  filters: AdminListingFilters;
  loading: boolean;
  error: string;
  onFilterChange: (key: keyof AdminListingFilters, value: string | number) => void;
  onApply: () => void;
  onRefresh: () => void;
  onPause: (trip: Trip) => void;
  onResume: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
};

function ListingsPanel({
  categories,
  trips,
  filters,
  loading,
  error,
  onFilterChange,
  onApply,
  onRefresh,
  onPause,
  onResume,
  onDelete,
}: ListingsPanelProps) {
  return (
    <section className="panel" aria-labelledby="listings-title">
      <div className="panel-header">
        <div className="panel-title">
          <h2 id="listings-title">Listings Oversight</h2>
          <p>{trips.length} listings loaded</p>
        </div>
        <button className="button" onClick={onRefresh} type="button">
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      <div className="filter-grid">
        <div className="field">
          <label htmlFor="listing-search">Search</label>
          <input
            id="listing-search"
            value={filters.q || ''}
            onChange={(event) => onFilterChange('q', event.target.value)}
            placeholder="Title or destination"
          />
        </div>
        <div className="field">
          <label htmlFor="listing-category">Category</label>
          <select
            id="listing-category"
            value={filters.category || ''}
            onChange={(event) => onFilterChange('category', event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="listing-status">Status</label>
          <select
            id="listing-status"
            value={filters.status}
            onChange={(event) => onFilterChange('status', event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All statuses' : status}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="listing-sort">Sort</label>
          <select
            id="listing-sort"
            value={filters.sort || 'recent'}
            onChange={(event) => onFilterChange('sort', event.target.value)}
          >
            <option value="recent">Recent</option>
            <option value="departing">Departing</option>
            <option value="priceAsc">Price low to high</option>
            <option value="priceDesc">Price high to low</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="button primary" onClick={onApply} type="button">
            <Search size={18} />
            Search
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <div className="loading-state">
          <Loader2 className="spinner" aria-hidden="true" /> Loading listings
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">No listings found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Listing</th>
                <th>Destination</th>
                <th>Dates</th>
                <th>Seats</th>
                <th>Price</th>
                <th>Poster</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => {
                const poster = userFrom(trip.posterId);
                return (
                  <tr key={trip._id}>
                    <td>
                      <div className="cell-title">
                        <strong title={trip.title}>{trip.title}</strong>
                        <span>{categoryLabel(categories, trip.category)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        <MapPin size={13} />
                        {trip.destination?.name || '-'}
                      </span>
                    </td>
                    <td>
                      <div className="cell-title">
                        <strong>
                          <Calendar size={13} /> {formatDate(trip.startDate)}
                        </strong>
                        <span>{formatDate(trip.endDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        <Users size={13} />
                        {trip.seatsRemaining ?? 0}/{trip.totalSeats}
                      </span>
                    </td>
                    <td>
                      <span className="badge">
                        <IndianRupee size={13} />
                        {formatMoney(trip.pricePerPerson)}
                      </span>
                    </td>
                    <td>
                      <div className="cell-title">
                        <strong>{poster?.organizationName || poster?.name || '-'}</strong>
                        <span>{poster?.mobile || ''}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${trip.status}`}>{trip.status}</span>
                    </td>
                    <td>
                      <div className="actions">
                        {trip.status === 'live' && (
                          <button
                            className="icon-button"
                            title="Pause listing"
                            aria-label="Pause listing"
                            onClick={() => onPause(trip)}
                            type="button"
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        {trip.status === 'paused' && (
                          <button
                            className="icon-button"
                            title="Resume listing"
                            aria-label="Resume listing"
                            onClick={() => onResume(trip)}
                            type="button"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        {trip.status !== 'deleted' && (
                          <button
                            className="icon-button"
                            title="Delete listing"
                            aria-label="Delete listing"
                            onClick={() => onDelete(trip)}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default App;
