import type { RiskInput } from '../../domain/entities/Risk';
import { RiskCategory, RiskStatus } from '../../domain/entities/Risk';

/** 5 riesgos de ejemplo que se cargan si localStorage está vacío. */
export const SEED_RISKS: readonly RiskInput[] = [
  {
    title: 'Acceso no autorizado a sistemas financieros',
    description:
      'Usuarios con permisos excesivos pueden consultar o modificar registros contables sin supervisión.',
    category: RiskCategory.Tecnologico,
    probability: 4,
    impact: 5,
    owner: 'Dirección de TI',
    status: RiskStatus.EnMitigacion,
    mitigationPlan:
      'Revisión trimestral de roles y aplicación del principio de mínimo privilegio.',
  },
  {
    title: 'Conciliaciones bancarias fuera de plazo',
    description:
      'Las conciliaciones mensuales se cierran con más de 15 días de retraso.',
    category: RiskCategory.Financiero,
    probability: 3,
    impact: 3,
    owner: 'Gerencia de Tesorería',
    status: RiskStatus.Abierto,
    mitigationPlan: 'Automatizar la carga de extractos bancarios.',
  },
  {
    title: 'Incumplimiento de la normativa de protección de datos',
    description:
      'Falta de registro de tratamiento de datos personales de clientes.',
    category: RiskCategory.Legal,
    probability: 2,
    impact: 5,
    owner: 'Departamento Jurídico',
    status: RiskStatus.Abierto,
    mitigationPlan: 'Levantar el inventario de tratamientos y designar un DPO.',
  },
  {
    title: 'Dependencia de un único proveedor logístico',
    description:
      'El 80 % de los envíos se concentra en un solo operador sin contrato de respaldo.',
    category: RiskCategory.Operativo,
    probability: 3,
    impact: 4,
    owner: 'Gerencia de Operaciones',
    status: RiskStatus.EnMitigacion,
    mitigationPlan: 'Homologar dos proveedores alternos antes del cierre del año.',
  },
  {
    title: 'Gestión tardía de quejas en redes sociales',
    description:
      'Los reclamos públicos se responden en promedio a las 48 horas.',
    category: RiskCategory.Reputacional,
    probability: 2,
    impact: 2,
    owner: 'Comunicación Corporativa',
    status: RiskStatus.Cerrado,
    mitigationPlan: 'Protocolo de respuesta en menos de 4 horas hábiles.',
  },
];
