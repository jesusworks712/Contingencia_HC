# Sistema de Contingencia - Historias Clinicas
## Guia Rapida de Uso

**IPS Rehabilitar** | Uso exclusivo cuando el sistema oficial (PANA) no esta disponible

---

## ¿Cuando usar este sistema?

Unicamente cuando el sistema PANA no funciona (caida de internet, servidor caido,
mantenimiento, etc.) y necesitas seguir atendiendo pacientes sin perder la
informacion de la consulta.

**Este sistema NO reemplaza a PANA.** Es un respaldo temporal. Cuando PANA
vuelva a funcionar, cada historia que hayas creado aqui debe transcribirse
manualmente al sistema oficial usando el PDF que este sistema genera.

---

## 1. Como ingresar

1. Abre el navegador (Chrome, Edge, el que tengas)
2. Entra a la direccion que te indique el area de sistemas:
   `http://[IP-DEL-SERVIDOR]:8000`
3. Ingresa tu **usuario** y **contraseña** (los mismos que te asignaron)
4. Clic en "Iniciar Sesion"

> Si no tienes usuario todavia, pide a un colega que ya tenga acceso que te
> registre desde el boton **"Medicos"** en la parte superior, o contacta al
> area de sistemas.

---

## 2. Como crear una historia clinica nueva

El formulario esta dividido en **9 modulos**, visibles en la barra lateral
izquierda. Debes ir llenando uno por uno, en orden:

| # | Modulo | Contenido |
|---|--------|-----------|
| 1 | Identificacion | Datos del paciente (nombre, cedula, contacto, etc.) |
| 2 | Datos de Atencion | Motivo de consulta y enfermedad actual |
| 3 | Antecedentes | Alergias, traumatologicos, quirurgicos |
| 4 | Examen Sistema Fisico | Revision por sistemas |
| 5 | Signos Vitales | Temperatura, tension, peso, talla, etc. |
| 6 | Examen Fisico Segmentario | Hallazgos por segmento corporal |
| 7 | Valoracion Medica | Diagnosticos y clasificacion |
| 8 | Incapacidad / Apoyo Diagnostico | Incapacidad y examenes solicitados |
| 9 | Medicamentos / Recomendaciones | Formulacion y recomendaciones finales |

**Pasos:**

1. Llena el **Modulo 1** con los datos del paciente (nombre y cedula son
   obligatorios)
2. Clic en **"Guardar y Siguiente"** — esto guarda automaticamente y te lleva
   al siguiente modulo
3. Repite hasta llegar al Modulo 9
4. En el Modulo 9 veras dos botones distintos:
   - **"Guardar borrador"**: guarda sin cerrar la historia, por si necesitas
     seguir editandola despues
   - **"Finalizar Historia"**: cierra la historia definitivamente. Una vez
     finalizada, **no se puede editar mas**

> **Importante:** el sistema guarda automaticamente cada vez que avanzas de
> modulo. Si se corta la luz o se cierra el navegador por accidente, no
> pierdes lo que ya guardaste — solo vuelve a entrar y busca la historia
> (ver seccion 4) para continuar donde ibas.

---

## 3. Campos con lista de items (Apoyo Diagnostico y Medicamentos)

En los Modulos 8 y 9 hay secciones donde puedes agregar **varios items**
(examenes de apoyo, medicamentos formulados):

1. Clic en **"+ Agregar item"** o **"+ Agregar medicamento"**
2. Llena los campos de esa fila (codigo, nombre, dosis, etc.)
3. Repite tantas veces como necesites
4. Si te equivocas, clic en **"Eliminar"** en la fila que quieras quitar

---

## 4. Como buscar una historia ya creada

1. Clic en **"Buscar Historias"** en la parte superior
2. Escribe la **cedula** o el **nombre** del paciente
3. Clic en **"Buscar"** (o deja el campo vacio para ver las mas recientes)
4. Cada resultado muestra si esta en estado **Borrador** (aun se puede
   editar) o **Completa** (ya finalizada)

---

## 5. Como generar el PDF para transcribir a PANA

1. Busca la historia (paso anterior)
2. Clic en **"Ver PDF"** — se abre en una pestaña nueva
3. Puedes imprimirlo o dejarlo abierto en pantalla
4. Cuando PANA vuelva a funcionar, usa este PDF como guia para transcribir
   la informacion al sistema oficial

> El PDF se puede generar tanto de historias en borrador como finalizadas —
> util si necesitas revisar el avance antes de terminar.

---

## 6. Preguntas frecuentes

**¿Que pasa si cierro el navegador a mitad de una historia?**
No se pierde nada. Todo lo que ya diligenciaste hasta el ultimo modulo donde
diste "Guardar y Siguiente" queda guardado. Busca la historia por cedula y
retoma donde quedaste.

**¿Puedo editar una historia despues de finalizarla?**
No. Una vez das clic en "Finalizar Historia", queda bloqueada para evitar
cambios accidentales despues de haberla transcrito a PANA. Si necesitas
corregir algo, avisa al area de sistemas.

**¿Que hago si el sistema no carga o marca error de conexion?**
Verifica que el equipo que hace de servidor este encendido y que estes
conectado a la red de la IPS (no a datos moviles ni otra red). Si el
problema persiste, contacta al area de sistemas.

**¿Otros medicos pueden ver mis historias?**
Si, cualquier medico con acceso al sistema puede buscar y ver cualquier
historia (esto es intencional, para que cualquiera pueda retomar una
consulta en caso de ausencia).

---

*Sistema desarrollado para contingencias de IPS Rehabilitar. Ante cualquier
duda tecnica, contactar al area de sistemas.*
