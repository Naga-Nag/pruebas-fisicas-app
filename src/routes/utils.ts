export function calcularIMC(peso: number, altura: number): { imc: number; clasificacion: string } {
  const imc = peso / (altura * altura);
  let clasificacion = "";
  if (imc < 18.5) clasificacion = "Bajo peso";
  else if (imc < 25) clasificacion = "Normal";
  else if (imc < 30) clasificacion = "Sobrepeso";
  else clasificacion = "Obesidad";
  return { imc, clasificacion };
}

export function calcularPenalizacion(altura: number, peso: number, cc: number, sexo: string): number {
  let penal = 0;
  let imcTexto = "";

  if (!isNaN(altura) && altura > 0 && !isNaN(peso)) {
    const { imc } = calcularIMC(peso, altura);

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