import { PageContainer } from "@/src/components/PageContainer";
import { useAuthStore } from "@/src/store/auth.store";
import { Avatar, Chip } from "@heroui/react";
import {
  User,
  CreditCard,
  Plus,
  UserPlus,
  Calendar,
  Bone,
  Cat,
  Stethoscope,
} from "lucide-react";
import { useTotalPets } from "../hooks/useTotalPets";
import { useTotalCustomers } from "../hooks/useTotalCustomers";
import { use } from "react";
import { useTotalTodayAppointments } from "../hooks/useTotalTodayAppointments";
import { useMontlyIncome } from "../hooks/useMonthlyIncome";
import { useRouter } from "next/navigation";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

function StatCard({ title, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-default-100 rounded-xl p-4">
      <div
        className={`w-9 h-9 rounded-lg ${colorClass} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-xs text-default-500 mb-1">{title}</p>
      <p className="text-2xl font-medium">{value}</p>
    </div>
  );
}

const activities = [
  {
    id: 1,
    action: "Nueva reserva",
    pet: "Max",
    owner: "Juan Pérez",
    time: "5 min",
    type: "nueva",
  },
  {
    id: 2,
    action: "Cita completada",
    pet: "Luna",
    owner: "María García",
    time: "1 h",
    type: "completada",
  },
  {
    id: 3,
    action: "Reserva cancelada",
    pet: "Buddy",
    owner: "Carlos López",
    time: "2 h",
    type: "cancelada",
  },
];

const dotColors: Record<string, string> = {
  nueva: "bg-primary",
  completada: "bg-success",
  cancelada: "bg-danger",
};

function UserWelcome() {
  const { user } = useAuthStore();
  const name = user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="bg-content1 border border-default-200 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={name} size="md" />
        <div>
          <p className="font-medium">Bienvenido, {name}</p>
          <p className="text-sm text-default-500">{user?.email}</p>
        </div>
      </div>
      <Chip color="success" size="sm">
        Activo
      </Chip>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="bg-content1 border border-default-200 rounded-xl p-4">
      <p className="text-sm font-medium mb-3">Actividad reciente</p>
      <div className="space-y-2">
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-default-50"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full ${dotColors[a.type]}`} />
              <div>
                <p className="text-sm font-medium">{a.action}</p>
                <p className="text-xs text-default-500">
                  {a.pet} · {a.owner}
                </p>
              </div>
            </div>
            <span className="text-xs text-default-400">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const router = useRouter();
  const actions = [
    {
      label: "Agregar cliente/dueño",
      icon: <UserPlus width={16} height={16} />,
      colorClass: "bg-green-600/10 text-green-600 ",
      to: "/admin/owners_pets/new",
    },
    {
      label: "Agregar mascota",
      icon: <Cat width={16} height={16} />,
      colorClass: "bg-amber-600/10 text-amber-600",
      to: "/admin/pets/new",
    },
    {
      label: "Agregar veterinario",
      icon: <Stethoscope width={16} height={16} />,
      colorClass: "bg-blue-600/10 text-blue-600",
      to: "/admin/veterinary/new",
    },
  ];

  return (
    <div className="bg-content1 border border-default-200 rounded-xl p-4">
      <p className="text-sm font-medium mb-3">Acciones rápidas</p>
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <button
            onClick={() => router.push(a.to)}
            key={a.label}
            className="flex items-center gap-2.5 p-2.5 rounded-lg border border-default-200 hover:bg-neutral-100 cursor-pointer text-sm text-left transition-colors"
          >
            <div
              className={`w-7 h-7 rounded-md ${a.colorClass} flex items-center justify-center`}
            >
              {a.icon}
            </div>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { data: pets } = useTotalPets();
  const { data: customers } = useTotalCustomers();
  const { data: appointments } = useTotalTodayAppointments();
  const { data: monthlyIncome } = useMontlyIncome();

  return (
    <PageContainer>
      <div className="space-y-4">
        <UserWelcome />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Reservas hoy"
            value={appointments?.count ?? 0}
            icon={<Calendar width={18} height={18} className="text-blue-600" />}
            colorClass="bg-blue-600/10"
          />
          <StatCard
            title="Clientes"
            value={customers ?? 0}
            icon={<User width={18} height={18} className="text-green-600" />}
            colorClass="bg-green-600/10 "
          />
          <StatCard
            title="Mascotas"
            value={pets ?? 0}
            icon={<Bone width={18} height={18} className="text-amber-600" />}
            colorClass="bg-amber-600/10 "
          />
          <StatCard
            title="Ingresos mes"
            value={monthlyIncome ?? 0}
            icon={
              <CreditCard width={18} height={18} className="text-indigo-600" />
            }
            colorClass="bg-indigo-600/10"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentActivity />
          <QuickActions />
        </div>
      </div>
    </PageContainer>
  );
}
