import { CampoTexto, CampoSelect } from "../Campos";

import { TIPOS_IDENTIFICACION } from "../../constants/identificacion";

interface Modulo1Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: string) => void;
}

export function Modulo1Identificacion({ datos, onChange }: Modulo1Props) {
  function set(campo: string) {
    return (valor: string) => onChange(campo, valor);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          1. Identificación del Paciente
        </h2>
        <p className="text-sm text-slate-500">
          Datos generales tal como aparecen en la historia clínica oficial.
        </p>
      </div>

      {/* Fecha de Atencion */}
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto
          label="Fecha de Atención"
          type="date"
          value={datos.fecha_atencion}
          onChange={set("fecha_atencion")}
        />
      </div>

      {/* Nombre */}
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto
          label="Nombre"
          value={datos.paciente_nombre}
          onChange={set("paciente_nombre")}
          className="col-span-3"
        />
      </div>

      {/* Tipo y Numero de Identificacion */}
      <div className="grid grid-cols-3 gap-4">
        <CampoSelect
          label="Tipo de Identificación"
          value={datos.paciente_tipo_identificacion}
          onChange={set("paciente_tipo_identificacion")}
          opciones={TIPOS_IDENTIFICACION}
        />
        <CampoTexto
          label="Número de Identificación"
          value={datos.paciente_cedula}
          onChange={set("paciente_cedula")}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <CampoSelect
          label="Sexo"
          value={datos.paciente_sexo}
          onChange={set("paciente_sexo")}
          opciones={["Masculino", "Femenino"]}
        />
        <CampoTexto
          label="Fecha Nacimiento"
          type="date"
          value={datos.paciente_fecha_nacimiento}
          onChange={set("paciente_fecha_nacimiento")}
        />
        <CampoTexto
          label="Ocupación"
          value={datos.paciente_ocupacion}
          onChange={set("paciente_ocupacion")}
        />
      </div>

      {/* Direccion, Telefono, Ciudad */}
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto
          label="Dirección"
          value={datos.paciente_direccion}
          onChange={set("paciente_direccion")}
        />
        <CampoTexto
          label="Teléfono"
          value={datos.paciente_telefono}
          onChange={set("paciente_telefono")}
        />
        <CampoTexto
          label="Ciudad Residencia"
          value={datos.paciente_ciudad_residencia}
          onChange={set("paciente_ciudad_residencia")}
        />
      </div>

      {/* Regimen, Convenio, Asegurador */}
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto
          label="Régimen"
          value={datos.paciente_regimen}
          onChange={set("paciente_regimen")}
        />
        <CampoTexto
          label="Convenio"
          value={datos.paciente_convenio}
          onChange={set("paciente_convenio")}
        />
        <CampoTexto
          label="Asegurador"
          value={datos.paciente_asegurador}
          onChange={set("paciente_asegurador")}
        />
      </div>

      {/* Rango, Estado, Discapacidad */}
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto
          label="Rango"
          value={datos.paciente_rango}
          onChange={set("paciente_rango")}
        />
        <CampoTexto
          label="Estado"
          value={datos.paciente_estado_civil}
          onChange={set("paciente_estado_civil")}
        />
        <CampoTexto
          label="Discapacidad"
          value={datos.paciente_discapacidad}
          onChange={set("paciente_discapacidad")}
        />
      </div>

      {/* Etnia, Religion, Poblacion */}
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto
          label="Etnia"
          value={datos.paciente_etnia}
          onChange={set("paciente_etnia")}
        />
        <CampoTexto
          label="Religión"
          value={datos.paciente_religion}
          onChange={set("paciente_religion")}
        />
        <CampoTexto
          label="Población"
          value={datos.paciente_poblacion}
          onChange={set("paciente_poblacion")}
        />
      </div>

      {/* Acompañante */}
      <div className="border-t border-slate-200 pt-4">
        <div className="grid grid-cols-3 gap-4">
          <CampoTexto
            label="Acompañante"
            value={datos.acompanante}
            onChange={set("acompanante")}
          />
          <CampoTexto
            label="Parentesco"
            value={datos.parentesco_acompanante}
            onChange={set("parentesco_acompanante")}
          />
          <CampoTexto
            label="Teléfono"
            value={datos.telefono_acompanante}
            onChange={set("telefono_acompanante")}
          />
        </div>
      </div>

      {/* Responsable */}
      <div>
        <div className="grid grid-cols-3 gap-4">
          <CampoTexto
            label="Responsable"
            value={datos.responsable}
            onChange={set("responsable")}
          />
          <CampoTexto
            label="Parentesco"
            value={datos.parentesco_responsable}
            onChange={set("parentesco_responsable")}
          />
          <CampoTexto
            label="Teléfono"
            value={datos.telefono_responsable}
            onChange={set("telefono_responsable")}
          />
        </div>
      </div>
    </div>
  );
}