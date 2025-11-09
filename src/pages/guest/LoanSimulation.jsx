import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppData } from "../../context/AppDataContext";

export default function SimulationPage() {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
		clearErrors,
	} = useForm();

	const { creditTypes } = useAppData();

	const initialCreditType = {
		defaultAnnualRate: 0,
		defaultFees: 0,
		defaultInsuranceRate: 0,
		maxMonths: Infinity,
		minAmount: 0,
		maxAmount: Infinity,
	};

	const [creditType, setCreditType] = useState(initialCreditType);

	useEffect(() => {
		clearErrors();
		const selectedCreditType = creditTypes.find((type) => type.id === watch("creditType"));

		if (selectedCreditType) {
			setCreditType(selectedCreditType);
			setValue("annualRate", selectedCreditType.defaultAnnualRate);
			setValue("fees", selectedCreditType.defaultFees);
			setValue("insuranceRate", selectedCreditType.defaultInsuranceRate);
		} else {
			setCreditType(initialCreditType);
		}
		console.log(watch("creditType"));
	}, [watch("creditType")]);

	const [results, setResults] = useState({
		monthlyPayment: null,
		totalCost: null,
		apr: null,
		amortization: [],
	});

	// Fonction de calcul
	const onSubmit = (data) => {
		console.log(data);
		const amount = Number(data.amount);
		const months = Number(data.months);
		const annualRate = Number(data.annualRate) / 100; // Convertir le pourcentage en décimal
		const monthlyRate = annualRate / 12; // Taux mensuel en décimal
		const fees = Number(data.fees);
		const insuranceRate = Number(data.insuranceRate) / 100 / 12; // Taux d'assurance mensuel en décimal

		// Mensualité sans assurance (formule de remboursement d'emprunt)
		const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

		// Assurance mensuelle (taux appliqué au capital emprunté)
		const insuranceMonthly = amount * insuranceRate;

		// Mensualité totale
		const globalMonthlyPayment = monthlyPayment + insuranceMonthly;

		// Coût total du crédit
		const totalCost = monthlyPayment * months + insuranceMonthly * months + fees;

		// TAEG (Taux Annuel Effectif Global) - approximation
		const totalInterests = monthlyPayment * months - amount;
		const totalInsurance = insuranceMonthly * months;
		const taeg = ((totalInterests + totalInsurance + fees) / amount) * (12 / months) * 100;

		// Tableau d'amortissement
		let remaining = amount;
		let amortization = [];

		for (let month = 1; month <= Math.min(months, 3); month++) {
			const interest = remaining * monthlyRate;
			const principal = monthlyPayment - interest;
			const insurance = insuranceMonthly;
			const payment = monthlyPayment + insurance;

			remaining -= principal;

			amortization.push({
				month,
				interest: interest.toFixed(2),
				principal: principal.toFixed(2),
				insurance: insurance.toFixed(2),
				monthly: payment.toFixed(2),
				remaining: remaining > 0 ? Math.max(0, remaining).toFixed(2) : "0.00",
			});
		}

		setResults({
			monthlyPayment: globalMonthlyPayment.toFixed(2),
			totalCost: totalCost.toFixed(2),
			apr: taeg.toFixed(2),
			amortization,
		});
	};

	return (
		<div className="min-h-screen bg-black text-white">
			{/* HEADER */}
			<header className="border-b border-zinc-800 bg-zinc-950">
				<div className="max-w-7xl mx-auto px-6 py-12">
					<h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
						Simulation de Crédit
					</h1>
					<p className="text-xl text-zinc-400">Remplissez les informations pour simuler votre crédit</p>
				</div>
			</header>

			{/* MAIN */}
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* FORMULAIRE */}
					<section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
						<h2 className="text-3xl font-bold mb-8">Informations du crédit</h2>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Type */}
							<div>
								<label className="block text-sm font-semibold text-zinc-300 mb-3">Type de crédit</label>
								<select
									{...register("creditType", { required: "Le type de crédit est requis" })}
									className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl">
									<option value="">Sélectionnez un type</option>
									{creditTypes.map((type) => (
										<option key={type.id} value={type.id}>
											{type.label}
										</option>
									))}
								</select>
								{errors.creditType && <p className="text-red-400 text-sm mt-2">{errors.creditType.message}</p>}
							</div>

							{/* Montant */}
							<div>
								<label className="block text-sm font-semibold text-zinc-300 mb-3">Montant (MAD)</label>
								<input
									type="number"
									{...register("amount", {
										required: "Le montant est requis",
										min: {
											value: creditType.minAmount,
											message: `Montant minimum : ${creditType.minAmount}`,
										},
										max: {
											value: creditType.maxAmount,
											message: `Montant maximum : ${creditType.maxAmount}`,
										},
									})}
									className="input"
									placeholder="Ex : 100000"
								/>
								{errors.amount && <p className="text-red-400 text-sm mt-2">{errors.amount.message}</p>}
							</div>

							{/* Durée */}
							<div>
								<label className="block text-sm font-semibold text-zinc-300 mb-3">Durée (mois)</label>
								<input
									type="number"
									{...register("months", {
										required: "La durée est requise",
										min: { value: 2, message: `Durée minimum : 2 mois` },
										max: {
											value: creditType.maxMonths,
											message: `Durée maximum : ${creditType.maxMonths} mois`,
										},
									})}
									className="input"
									placeholder="Ex : 48"
								/>
								{errors.months && <p className="text-red-400 text-sm mt-2">{errors.months.message}</p>}
							</div>

							{/* Taux */}
							<div>
								<label className="block text-sm font-semibold text-zinc-300 mb-3">Taux annuel (%)</label>
								<input
									type="number"
									step="0.01"
									{...register("annualRate", { required: "Le taux annuel est requis" })}
									className="input"
									placeholder="Ex : 4.5"
								/>
								{errors.annualRate && <p className="text-red-400 text-sm mt-2">{errors.annualRate.message}</p>}
							</div>

							{/* Frais */}
							<div>
								<label className="block text-sm font-semibold text-zinc-300 mb-3">Frais fixes</label>
								<input
									type="number"
									{...register("fees", { required: "Les frais fixes sont requis" })}
									className="input"
									placeholder="Ex : 300"
								/>
								{errors.fees && <p className="text-red-400 text-sm mt-2">{errors.fees.message}</p>}
							</div>

							{/* Assurance */}
							<div>
								<label className="block text-sm font-semibold text-zinc-300 mb-3">Assurance (%)</label>
								<input
									type="number"
									step="0.01"
									{...register("insuranceRate", { required: "L'assurance est requise" })}
									className="input"
									placeholder="Ex : 0.20"
								/>
								{errors.insuranceRate && (
									<p className="text-red-400 text-sm mt-2">{errors.insuranceRate.message}</p>
								)}
							</div>

							<button
								type="submit"
								onClick={() => console.error(errors)}
								className="w-full bg-white text-black py-4 px-6 rounded-xl font-bold text-lg hover:bg-zinc-100 active:scale-95 transition">
								Simuler
							</button>
						</form>
					</section>

					{/* RESULTATS */}
					<section className="space-y-6">
						{/* Résumé */}
						<article className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
							<h2 className="text-3xl font-bold mb-8">Résultat de la simulation</h2>

							<div className="space-y-5">
								<Result label="Mensualité" value={results.monthlyPayment} />
								<Result label="Coût total" value={results.totalCost} />
								<Result label="TAEG" value={results.apr ? results.apr + "%" : null} />
							</div>
						</article>

						{/* Amortissement */}
						<article className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
							<h3 className="text-2xl font-bold mb-6">Tableau d'amortissement</h3>

							<table className="w-full">
								<thead>
									<tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
										{["Mois", "Capital", "Intérêts", "Assurance", "Mensualité", "Restant dû"].map((h) => (
											<th key={h} className="px-4 py-4 text-left">
												{h}
											</th>
										))}
									</tr>
								</thead>

								<tbody>
									{results.amortization.map((row) => (
										<tr key={row.month} className="border-b border-zinc-800 text-zinc-400">
											<td className="px-4 py-5">{row.month}</td>
											<td className="px-4 py-5">{row.principal}</td>
											<td className="px-4 py-5">{row.interest}</td>
											<td className="px-4 py-5">{row.insurance}</td>
											<td className="px-4 py-5">{row.monthly}</td>
											<td className="px-4 py-5">{row.remaining}</td>
										</tr>
									))}
								</tbody>
							</table>
						</article>
					</section>
				</div>
			</main>
		</div>
	);
}

function Result({ label, value }) {
	return (
		<div className="flex justify-between items-center p-5 bg-zinc-800 rounded-xl border border-zinc-700">
			<span className="text-zinc-300 font-semibold text-lg">{label}</span>
			<span className="text-3xl font-bold">{value ?? "—"}</span>
		</div>
	);
}
