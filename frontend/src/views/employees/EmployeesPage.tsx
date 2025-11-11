import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../utils/hooks';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { toast } from 'react-toastify';
import { EmployeeForm, EmployeeFormData } from './EmployeeForm';
import { Dialog } from 'primereact/dialog';



type Employee = {
	_id: string;
	name: string;
	email: string;
	role: 'Admin' | 'Editor' | 'Viewer';
	isActive: boolean;
	deletedAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

type PageResponse = {
	items: Employee[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export function EmployeesPage() {
	const token = localStorage.getItem('auth:accessToken');
	const me = useAppSelector((s) => s.auth.user);
	const [data, setData] = useState<PageResponse | null>(null);
	const [page, setPage] = useState(1);
	const [limit] = useState(5);
	const [search, setSearch] = useState('');
	const [role, setRole] = useState<string>('');
	const [active, setActive] = useState<string>('');
	const [visible, setIsVisible] = useState<boolean>(false);
	const [showDialog, setShowDialog] = useState(false);
	const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
	const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [employeeData, setEmployeeData] = useState<Partial<EmployeeFormData> | null>(null);
console.log(page,limit,search,role,active,data);
	useEffect(() => {
		const controller = new AbortController();
		debugger
		const params = new URLSearchParams();
		params.set('page', String(page));
		params.set('limit', String(limit));
		if (search) params.set('search', search);
		if (role) params.set('role', role);
		if (active) params.set('isActive', active);
		fetch(`/api/employees?${params.toString()}`, {
			headers: { Authorization: `Bearer ${token}` },
			credentials: 'include',
			signal: controller.signal
		})
			.then((r) => r.json())
			.then(setData)
			.catch(() => {});
		return () => controller.abort();
	}, [page, limit, search, role, active, token]);

	const loadEmployeeData = async (id: string) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/employees/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
				credentials: 'include'
			});
			if (!res.ok) throw new Error('Failed to load');
			const json = await res.json();
			setEmployeeData(json);
		} catch (e) {
			toast.error('Failed to load employee');
		} finally {
			setLoading(false);
		}
	};
	const deleteEmployee = async (id: string) => {
      
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/employees/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include'
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                toast.error(text || 'Delete failed');
                return;
            }
            toast.success('Deleted');
			setShowDialog(false);
			setDeletingEmployeeId(null);
            // Refresh the list after delete
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(limit));
            if (search) params.set('search', search);
            if (role) params.set('role', role);
            if (active) params.set('isActive', active);
            fetch(`/api/employees?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include'
            })
                .then((r) => r.json())
                .then(setData)
                .catch(() => {});
        } catch (e) {
            toast.error('Delete failed');
        } finally {
            setIsSubmitting(false);
        }
    };

	const openSidebar = (employeeId: string | null = null) => {
		setEditingEmployeeId(employeeId);
		setIsVisible(true);
		if (employeeId) {
			loadEmployeeData(employeeId);
		} else {
			setEmployeeData(null);
		}
	};

	const closeSidebar = () => {
		setIsVisible(false);
		setEditingEmployeeId(null);
		setEmployeeData(null);
	};

	const onFormSubmit = async (data: EmployeeFormData) => {
		setIsSubmitting(true);
		const method = editingEmployeeId ? 'PUT' : 'POST';
		const url = editingEmployeeId ? `/api/employees/${editingEmployeeId}` : '/api/employees';
		
		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				credentials: 'include',
				body: JSON.stringify(data)
			});
			if (!res.ok) {
				toast.error('Save failed');
			} else {
				toast.success('Saved');
				closeSidebar();
				// Refresh the employee list
				const params = new URLSearchParams();
				params.set('page', String(page));
				params.set('limit', String(limit));
				if (search) params.set('search', search);
				if (role) params.set('role', role);
				if (active) params.set('isActive', active);
				fetch(`/api/employees?${params.toString()}`, {
					headers: { Authorization: `Bearer ${token}` },
					credentials: 'include'
				})
					.then((r) => r.json())
					.then(setData)
					.catch(() => {});
			}
		} catch (e) {
			toast.error('Save failed');
		} finally {
			setIsSubmitting(false);
		}
	};

	const canCreate = useMemo(() => me?.role === 'Admin' || me?.role === 'Editor', [me?.role]);
	const canEdit = canCreate;
	const canDelete = me?.role === 'Admin';
	

	return (
		<div className="w-full flex flex-column gap-4 m-4">
			<h2>Employees</h2>
			<div className="flex justify-content-between align-items-center">
			<div className="flex gap-2">
				<InputText placeholder="Search name/email" value={search} onChange={(e) => setSearch(e.target.value)} />
				<Dropdown 
					value={role} 
					onChange={(e: { value: string }) => setRole(e.value)} 
					options={[
						{ label: 'All Roles', value: '' },
						{ label: 'Admin', value: 'Admin' },
						{ label: 'Editor', value: 'Editor' },
						{ label: 'Viewer', value: 'Viewer' }
					]} 
					optionLabel="label"
					optionValue="value"
					placeholder="All Roles" 
					className="w-full md:w-14rem" 
				/>
				<Dropdown 
					value={active} 
					onChange={(e: { value: string }) => setActive(e.value)} 
					options={[
						{ label: 'All Status', value: '' },
						{ label: 'Active', value: 'true' },
						{ label: 'Inactive', value: 'false' }
					]} 
					optionLabel="label"
					optionValue="value"
					placeholder="All Status" 
					className="w-full md:w-14rem" 
				/>
			</div>
				{canCreate && <Button onClick={() => openSidebar(null)}>Add Employee</Button>}
			</div>
			<DataTable
			value={data?.items ?? []}
			paginator
			rows={limit}
			first={(page - 1) * limit}
			totalRecords={data?.total ?? 0}
			loading={!data}
			lazy
			onPage={(e:any) => setPage(e?.page + 1)} // ✅ updates state
			paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
			currentPageReportTemplate="{first} to {last} of {totalRecords}"
			emptyMessage="No employees"
			>
				<Column field="name" header="Name" sortable body={(row: Employee) => (
						<div className={`${canEdit ? "cursor-pointer":""}`} onClick={() => canEdit&& openSidebar(row._id)} >
							{row.name}
						</div>
					)} />
				<Column field="email" header="Email" sortable />
				<Column field="role" header="Role" />
				<Column field="isActive" header="Status" body={(row: Employee) => (row.isActive ? 'Active' : 'Inactive')} />
				<Column
					header="Actions"
					body={(row: Employee) => (
						<Button label="Delete" className="p-button-text p-button-plain mr-2" onClick={() => { setShowDialog(true); setDeletingEmployeeId(row._id); }} disabled={!canDelete} />
						
					)}
				/>
			</DataTable>
			<Dialog header="Delete Employee" visible={showDialog} onHide={()=>setShowDialog} modal>
				<div>Are you sure you want to delete this employee?</div>
				<div className="flex justify-content-end gap-2 mt-4">
					<Button label="Cancel" className="p-button-secondary" onClick={()=>setShowDialog(false)} />
					<Button label="Delete" className="p-button-danger" onClick={()=>deleteEmployee(deletingEmployeeId || '')} />
				</div>
			</Dialog>
			<Sidebar position="right" visible={visible}onHide={()=>''} style={{ width: '50vw' }}>
				<div className="flex flex-column gap-3">
					<EmployeeForm
						initialData={employeeData || undefined}
						onSubmit={onFormSubmit}
						onCancel={closeSidebar}
						editingEmployeeId={editingEmployeeId}
						loading={loading}
						isSubmitting={isSubmitting}
					/>
				</div>
			</Sidebar>
		</div>
	);
}


