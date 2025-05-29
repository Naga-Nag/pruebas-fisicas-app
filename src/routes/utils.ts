export function calcularIMC(peso: number, alturaCm: number): { imc: number; clasificacion: string } {
  // Convertir altura de centímetros a metros
  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);
  let clasificacion = "";
  if (imc < 18.5) clasificacion = "Bajo peso";
  else if (imc < 25) clasificacion = "Normal";
  else if (imc < 30) clasificacion = "Sobrepeso";
  else clasificacion = "Obesidad";
  return { imc, clasificacion };
}

export function calcularPenalizacion(alturaCm: number, peso: number, cc: number, sexo: string): number {
  let penal = 0;

  // Convertir altura de centímetros a metros para el cálculo del IMC
  if (!isNaN(alturaCm) && alturaCm > 0 && !isNaN(peso)) {
    const alturaM = alturaCm / 100;
    const { imc } = calcularIMC(peso, alturaCm);

    if (imc >= 30) {
      penal -= 3;
    }
  }

  if (!isNaN(cc)) {
    if (sexo === "masculino" && cc >= 102) {
      penal -= 3;
    }
    if (sexo === "femenino" && cc >= 88) {
      penal -= 3;
    }
  }
  return penal;
}