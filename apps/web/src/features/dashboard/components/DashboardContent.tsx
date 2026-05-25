import { PageContainer } from "@/src/components/PageContainer";
import { useAuthStore } from "@/src/store/auth.store";
import { Avatar, Chip, Table } from "@heroui/react";
import {
  User,
  CreditCard,
  UserPlus,
  Calendar,
  Bone,
  Cat,
  Stethoscope,
} from "lucide-react";
import { useTotalPets } from "../hooks/useTotalPets";
import { useTotalCustomers } from "../hooks/useTotalCustomers";
import { useTotalTodayAppointments } from "../hooks/useTotalTodayAppointments";
import { useMontlyIncome } from "../hooks/useMonthlyIncome";
import { useRouter } from "next/navigation";
import { initialName } from "@/src/utilities/initials-name";
import { Span } from "next/dist/trace";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

function StatCard({ title, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs">
      <div
        className={`w-9 h-9 rounded-lg ${colorClass} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-[12px] font-bold text-zinc-500 mb-1 uppercase">
        {title}
      </p>
      <p className="text-3xl font-bold">{value}</p>
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
    petImage:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    action: "Cita completada",
    pet: "Luna",
    owner: "María García",
    time: "1 h",
    type: "completada",
    petImage:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    action: "Reserva cancelada",
    pet: "Buddy",
    owner: "Carlos López",
    time: "2 h",
    type: "cancelada",
    petImage:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    action: "Reserva cancelada",
    pet: "Doki",
    owner: "Lucas Ontaneda",
    time: "3 h",
    type: "pendiente",
    petImage:
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=100&h=100&fit=crop",
  },
];

const dotColors: Record<string, string> = {
  nueva: "border bg-sky-50 border-sky-600 text-sky-600",
  completada: "border bg-green-50 border-green-600 text-green-600",
  cancelada: "border bg-red-50 border-red-600 text-red-600",
  pendiente: "border bg-amber-50 border-amber-600 text-amber-600",
};

function UserWelcome() {
  const { user } = useAuthStore();
  const name = user?.email?.split("@")[0] || "Usuario";

  return (
    <div className=" border border-default-200 rounded-xl p-4 flex items-center justify-between bg-white shadow-xs">
      <div className="flex items-center gap-3">
        <Avatar>
          <Avatar.Image alt="John Doe" src={user?.email} />
          <Avatar.Fallback>{initialName(name)}</Avatar.Fallback>
        </Avatar>

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
    <div className="bg-white border border-zinc-200  shadow-xs rounded-xl">
      <p className="text-sm font-medium  p-4">Actividad reciente</p>
      <Table className="rounded-b-xl rounded-t-none">
        <Table.ScrollContainer>
          <Table.Content aria-label="Team members">
            <Table.Header>
              <Table.Column>Foto</Table.Column>
              <Table.Column isRowHeader>Mascota</Table.Column>
              <Table.Column>Dueño</Table.Column>
              <Table.Column>Estdo</Table.Column>
            </Table.Header>
            <Table.Body>
              {activities.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell>
                    <Avatar size="sm">
                      <Avatar.Image src={a.petImage} />
                      <Avatar.Fallback>{initialName(a.pet)}</Avatar.Fallback>
                    </Avatar>
                  </Table.Cell>

                  <Table.Cell>{a.pet}</Table.Cell>
                  <Table.Cell>{a.owner}</Table.Cell>
                  <Table.Cell>
                    <span
                      className={`${dotColors[a.type]}  px-2 py-1 rounded-full text-xs `}
                    >
                      {a.type}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
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
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
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
            title="Total Clientes"
            value={customers ?? 0}
            icon={<User width={18} height={18} className="text-green-600" />}
            colorClass="bg-green-600/10 "
          />

          <StatCard
            title="Total Mascotas"
            value={pets ?? 0}
            icon={<Bone width={18} height={18} className="text-amber-600" />}
            colorClass="bg-amber-600/10 "
          />

          <StatCard
            title="Total Ingresos mes (USD)"
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
