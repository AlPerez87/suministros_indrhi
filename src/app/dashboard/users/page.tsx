"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { getStoredUsers, updateUser, addUser as addUserToStorage, deleteUser as deleteUserFromStorage } from "@/lib/storage-api";
import { User, Role } from "@/lib/types";
import { DataTable } from "@/components/users/data-table";
import { getColumns } from "@/components/users/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { UserModal } from "@/components/users/user-modal";
import { PasswordModal } from "@/components/users/password-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function UsersPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  React.useEffect(() => {
    const fetchUsers = async () => {
      const users = await getStoredUsers();
      setAllUsers(users);
    };
    fetchUsers();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  React.useEffect(() => {
    if (!isLoading && user?.role !== 'SuperAdmin') {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "No tienes permiso para ver esta página.",
      });
      router.replace('/dashboard');
    }
  }, [user, isLoading, router, toast]);

  const handleRoleChange = (userId: string, role: Role) => {
    const updatedUsers = updateUser(userId, { role });
    setAllUsers(updatedUsers);
    toast({
        title: "Rol Actualizado",
        description: `El rol del usuario ha sido cambiado a ${role}.`
    });
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'avatar'>) => {
    if (editingUser) {
      // Editar usuario existente
      const updatedData: Partial<User> = {
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
      };
      
      // Solo actualizar password si se proporcionó uno nuevo
      if (newUser.password && newUser.password.length >= 6) {
        updatedData.password = newUser.password;
      }
      
      const updatedUsers = updateUser(editingUser.id, updatedData);
      setAllUsers(updatedUsers);
      toast({ 
        title: 'Usuario Actualizado', 
        description: `Los datos de ${newUser.name} han sido actualizados.` 
      });
      setEditingUser(null);
    } else {
      // Crear nuevo usuario
      const user: User = {
          ...newUser,
          id: `user-${Date.now()}`,
          avatar: `https://picsum.photos/seed/user${Date.now()}/100/100`,
      };
      const updatedUsers = addUserToStorage(user);
      setAllUsers(updatedUsers);
      toast({ title: 'Usuario Creado', description: `${user.name} ha sido añadido con contraseña.` });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handlePasswordChange = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (password: string) => {
    if (selectedUser) {
      const updatedUsers = updateUser(selectedUser.id, { password });
      setAllUsers(updatedUsers);
      toast({
        title: 'Contraseña Actualizada',
        description: `La contraseña de ${selectedUser.name} ha sido cambiada exitosamente.`,
      });
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      const updatedUsers = deleteUserFromStorage(userToDelete.id);
      setAllUsers(updatedUsers);
      toast({
        title: 'Usuario Eliminado',
        description: `${userToDelete.name} ha sido eliminado del sistema.`,
        variant: 'destructive',
      });
      setUserToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  
  const columns = useMemo(() => getColumns({ 
    onRoleChange: handleRoleChange,
    onPasswordChange: handlePasswordChange,
    onDeleteUser: handleDeleteUser,
    onEditUser: handleEditUser,
  }), []);

  if (isLoading || user?.role !== 'SuperAdmin') {
    return <div>Cargando o redirigiendo...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Crear usuarios y gestionar sus roles y permisos."
      >
        <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Usuario
        </Button>
      </PageHeader>
      
      <DataTable columns={columns} data={allUsers} />
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }} 
        onSubmit={handleAddUser}
        editingUser={editingUser}
      />
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedUser(null);
        }} 
        onSubmit={handlePasswordSubmit}
        userName={selectedUser?.name || ''}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente a{' '}
              <strong>{userToDelete?.name}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
