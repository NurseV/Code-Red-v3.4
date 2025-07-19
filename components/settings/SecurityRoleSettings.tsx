

import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import { SecurityRole } from '../../types';
import Button from '../ui/Button';
import { KeyIcon, PlusIcon, ChevronDownIcon, LockIcon, CopyIcon, SearchIcon } from '../icons/Icons';
import { PERMISSION_GROUPS, ALL_NAV_LINKS } from '../../constants';
import Accordion from '../ui/Accordion';

// Helper to get all permissions for a role, including inherited ones
const getRolePermissions = (roleId: string, allRoles: SecurityRole[]): Set<string> => {
    const roleMap = new Map(allRoles.map(r => [r.id, r]));
    
    const collectPermissions = (currentId: string | null | undefined, collected: Set<string>): Set<string> => {
        if (!currentId) return collected;
        const currentRole = roleMap.get(currentId);
        if (!currentRole) return collected;

        currentRole.permissions.forEach(p => collected.add(p));
        return collectPermissions(currentRole.parentId, collected);
    };

    const role = roleMap.get(roleId);
    if (!role) return new Set();

    return collectPermissions(role.id, new Set());
};

const RoleEditForm: React.FC<{
    role: SecurityRole;
    allRoles: SecurityRole[];
    onSave: (role: SecurityRole) => void;
    onCancel: () => void;
}> = ({ role, allRoles, onSave, onCancel }) => {
    const [formData, setFormData] = useState<SecurityRole>(role);
    const [permissionSearch, setPermissionSearch] = useState('');

    useEffect(() => {
        setFormData(role);
    }, [role]);
    
    const inheritedPermissions = useMemo(() => {
        const roleMap = new Map(allRoles.map(r => [r.id, r]));
        const collect = (currentId: string | null, collected: Set<string>): Set<string> => {
            if (!currentId) return collected;
            const currentRole = roleMap.get(currentId);
            if (!currentRole) return collected;
            currentRole.permissions.forEach(p => collected.add(p));
            return collect(currentRole.parentId, collected);
        };
        return collect(formData.parentId, new Set());
    }, [formData.parentId, allRoles]);

    const handlePermissionChange = (permissionId: string) => {
        const newPermissions = formData.permissions.includes(permissionId)
            ? formData.permissions.filter(p => p !== permissionId)
            : [...formData.permissions, permissionId];
        setFormData({ ...formData, permissions: newPermissions });
    };

    const handleModuleVisibilityChange = (moduleLabel: string) => {
        const newModules = formData.visibleModules.includes(moduleLabel)
            ? formData.visibleModules.filter(m => m !== moduleLabel)
            : [...formData.visibleModules, moduleLabel];
        setFormData({ ...formData, visibleModules: newModules });
    };
    
    const handleSelectAllGroup = (permissions: typeof PERMISSION_GROUPS[string], checked: boolean) => {
        const groupPermissionIds = permissions.map(p => p.id).filter(id => !inheritedPermissions.has(id));
        let newPermissions = [...formData.permissions];
        if(checked) {
            newPermissions = [...new Set([...newPermissions, ...groupPermissionIds])];
        } else {
            newPermissions = newPermissions.filter(p => !groupPermissionIds.includes(p));
        }
        setFormData({...formData, permissions: newPermissions});
    };

    return (
        <div className="bg-dark-bg mt-2 mb-4 p-4 md:p-6 border-2 border-brand-primary rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Column 1: Core details and functional permissions */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Role Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={2}
                            className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Data Access Scope</label>
                        <select
                            value={formData.scope || 'Station'}
                            onChange={(e) => setFormData({...formData, scope: e.target.value as SecurityRole['scope']})}
                            className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text"
                        >
                            <option value="Own">Own Records Only</option>
                            <option value="Shift/Platoon">Own Shift/Platoon</option>
                            <option value="Station">Own Station</option>
                            <option value="Global">Global (All Records)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Parent Role (Inherits From)</label>
                        <select
                            value={formData.parentId || 'none'}
                            onChange={(e) => setFormData({...formData, parentId: e.target.value === 'none' ? null : e.target.value})}
                            className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text"
                        >
                            <option value="none">None</option>
                            {allRoles
                                .filter(r => r.id !== formData.id && r.name !== 'Administrator')
                                .map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))
                            }
                        </select>
                    </div>
                     <Accordion title="Functional Permissions" icon={<KeyIcon className="h-5 w-5" />} defaultOpen={true}>
                         <div className="relative mb-3">
                             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-text-secondary"/>
                             <input type="search" placeholder="Search permissions..." value={permissionSearch} onChange={e => setPermissionSearch(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-md py-1.5 pl-9 pr-4 text-dark-text text-sm"/>
                         </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {Object.entries(PERMISSION_GROUPS)
                                .map(([groupName, permissions]) => ({
                                    groupName,
                                    permissions: permissions.filter(p => p.label.toLowerCase().includes(permissionSearch.toLowerCase()))
                                }))
                                .filter(g => g.permissions.length > 0)
                                .map(({groupName, permissions}) => {
                                    const groupPermissionIds = permissions.map(p => p.id);
                                    const groupDirectPermissions = formData.permissions.filter(p => groupPermissionIds.includes(p));
                                    const allSelected = groupPermissionIds.every(id => formData.permissions.includes(id) || inheritedPermissions.has(id));
                                return (
                                <div key={groupName}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-dark-text text-sm">{groupName}</h4>
                                        <label className="flex items-center space-x-2 cursor-pointer text-xs text-dark-text-secondary">
                                            <input type="checkbox"
                                                checked={allSelected}
                                                ref={el => { if(el) el.indeterminate = !allSelected && groupDirectPermissions.length > 0 }}
                                                onChange={e => handleSelectAllGroup(permissions, e.target.checked)}
                                            />
                                            <span>Select All</span>
                                        </label>
                                    </div>
                                    <div className="space-y-2 pl-2">
                                        {permissions.map(permission => {
                                            const isInherited = inheritedPermissions.has(permission.id);
                                            const hasDependency = permission.dependency ? formData.permissions.includes(permission.dependency) || inheritedPermissions.has(permission.dependency) : true;
                                            const isDisabled = isInherited || !hasDependency;
                                            const isChecked = formData.permissions.includes(permission.id) || isInherited;
                                            return (
                                                <div key={permission.id} title={permission.description} className="group">
                                                <label className={`flex items-center space-x-3 ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handlePermissionChange(permission.id)}
                                                        disabled={isDisabled}
                                                        className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent disabled:opacity-50"
                                                    />
                                                    <span className="text-dark-text-secondary text-sm">{permission.label}</span>
                                                    {isInherited && <span title="Inherited from parent role"><LockIcon className="h-4 w-4 text-yellow-400" /></span>}
                                                </label>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </Accordion>
                </div>
                {/* Column 2: Module Visibility */}
                <div>
                     <Accordion title="Module Visibility" icon={<ChevronDownIcon className="h-5 w-5" />} defaultOpen={true}>
                        <div className="space-y-1 max-h-[40rem] overflow-y-auto pr-2">
                            {ALL_NAV_LINKS.map(link => (
                                <div key={link.label} className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-dark-card">
                                    <label htmlFor={`module-${link.label}`} className="flex items-center space-x-2 text-dark-text-secondary text-sm cursor-pointer">
                                        <link.icon className="h-5 w-5" />
                                        <span>{link.label}</span>
                                    </label>
                                    <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            id={`module-${link.label}`}
                                            checked={formData.visibleModules.includes(link.label)}
                                            onChange={() => handleModuleVisibilityChange(link.label)}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label htmlFor={`module-${link.label}`} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"></label>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </Accordion>
                </div>
            </div>
             <div className="flex justify-end pt-6 mt-4 border-t border-dark-border space-x-2">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(formData)}>Save Role</Button>
            </div>
        </div>
    );
};


const SecurityRoleSettings: React.FC = () => {
    const [roles, setRoles] = useState<SecurityRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newRoleData, setNewRoleData] = useState<SecurityRole | null>(null);

    const fetchRoles = () => {
        setIsLoading(true);
        api.getSecurityRoles().then(setRoles).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleEditClick = (roleId: string) => {
        setIsCreatingNew(false);
        setEditingRoleId(prevId => (prevId === roleId ? null : roleId));
    };

    const handleAddNewClick = () => {
        setEditingRoleId(null);
        setNewRoleData({ id: '', name: 'New Role', description: '', scope: 'Station', permissions: [], parentId: null, visibleModules: ALL_NAV_LINKS.map(l => l.label) });
        setIsCreatingNew(true);
    };

    const handleCopyClick = (roleId: string) => {
        const roleToCopy = roles.find(r => r.id === roleId);
        if(!roleToCopy) return;
        setEditingRoleId(null);
        setNewRoleData({ ...roleToCopy, id: '', name: `${roleToCopy.name} (Copy)`});
        setIsCreatingNew(true);
    };

    const handleSave = async (role: SecurityRole) => {
        if (!role.name) {
            alert("Role Name is required.");
            return;
        }
        try {
            await api.updateSecurityRole(role);
            fetchRoles();
            setEditingRoleId(null);
            setIsCreatingNew(false);
            setNewRoleData(null);
        } catch (error) {
            alert('Failed to save security role.');
        }
    };

    const handleCancel = () => {
        setEditingRoleId(null);
        setIsCreatingNew(false);
        setNewRoleData(null);
    };

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading security roles...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <p className="text-sm text-dark-text-secondary">Define custom security roles and their permissions across the system.</p>
                <Button onClick={handleAddNewClick} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Role</Button>
            </div>
            <div className="space-y-3">
                {roles.map(role => {
                    const totalPermissions = getRolePermissions(role.id, roles).size;
                    return (
                        <div key={role.id}>
                            <div className="bg-dark-bg p-4 rounded-lg border border-dark-border flex justify-between items-center">
                                <div className="flex items-center">
                                    <KeyIcon className="h-6 w-6 mr-3 text-yellow-400" />
                                    <div>
                                        <h4 className="font-bold text-dark-text">{role.name}</h4>
                                        <p className="text-xs text-dark-text-secondary">{totalPermissions} total permissions</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <Button
                                        variant="ghost"
                                        onClick={() => handleCopyClick(role.id)}
                                        title="Copy Role"
                                        className="p-2"
                                    >
                                        <CopyIcon className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleEditClick(role.id)}
                                        disabled={role.name === 'Administrator'}
                                        title={role.name === 'Administrator' ? 'The Administrator role cannot be edited.' : ''}
                                    >
                                        {editingRoleId === role.id ? 'Close' : 'Edit'}
                                    </Button>
                                </div>
                            </div>
                            {editingRoleId === role.id && (
                                <RoleEditForm
                                    role={role}
                                    allRoles={roles}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
             {isCreatingNew && newRoleData && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-dark-text mb-2">Create New Role</h3>
                    <RoleEditForm
                        role={newRoleData}
                        allRoles={roles}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
             )}
        </div>
    );
};

export default SecurityRoleSettings;