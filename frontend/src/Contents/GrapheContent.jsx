import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import StatistiqueService from '../services/StatistiqueService';

// =========================================================================
// CODES COULEURS UTILISÉS DANS L'APPLICATION
// =========================================================================
const COLORS = {
    GREEN: '#25963F',
    BLUE: '#1E90FF',
    PRIMARY: '#667eea',
    SECONDARY: '#ec4899',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    INFO: '#06b6d4',
    NEUTRAL: '#764ba2',
};

const PIE_COLORS_SEXE = [COLORS.BLUE, COLORS.DANGER];
const REGION_COLORS = ['#667eea', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#764ba2', '#8b5cf6'];
const AGE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

const formatYAxis = (tick) => {
    if (tick >= 1000000) return (tick / 1000000).toFixed(1) + 'M';
    if (tick >= 1000) return (tick / 1000).toFixed(0) + 'K';
    return tick;
};

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
};

const getPaiementColor = (name) => {
    switch (name) {
        case 'SUCCESS':
            return COLORS.GREEN;
        case 'PENDING':
            return COLORS.WARNING;
        case 'FAILED':
            return COLORS.DANGER;
        default:
            return COLORS.NEUTRAL;
    }
}

export default function GrapheContent() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                setLoading(true);

                // Récupération de TOUTES les données complexes pour les graphiques
                const [
                    totalCandidats, sexeCandidats, candidatsParSpecialite, candidatsParFiliere,
                    candidatsParConcours, nombrePaiementsStatut, totalPaiements, candidatsParSession,
                    candidatsParMention, regions, tranchesAge, centresExamen
                ] = await Promise.all([
                    StatistiqueService.totalCandidats(),
                    StatistiqueService.sexeCandidats(),
                    StatistiqueService.candidatsParSpecialite(),
                    StatistiqueService.candidatsParFiliere(),
                    StatistiqueService.candidatsParConcours(),
                    StatistiqueService.nombrePaiementsStatut(),
                    StatistiqueService.totalPaiements(),
                    StatistiqueService.candidatsParSession(),
                    StatistiqueService.candidatsParMention(),
                    StatistiqueService.candidatsParRegionDetaille(),
                    StatistiqueService.candidatsParTrancheAge(),
                    StatistiqueService.statsParCentreExamen()
                ]);

                setStats({
                    totalCandidats,
                    sexeCandidats,
                    candidatsParSpecialite,
                    candidatsParFiliere,
                    candidatsParConcours,
                    nombrePaiementsStatut,
                    totalPaiements,
                    candidatsParSession,
                    candidatsParMention,
                    regions,
                    tranchesAge,
                    centresExamen
                });

            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement des statistiques. Vérifiez la connexion au service.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, []);

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh', background: `linear-gradient(135deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)` }}>
                <div className="spinner-border text-white mb-4" role="status" style={{ width: '4rem', height: '4rem', borderWidth: '0.4rem' }}>
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <h4 className="text-white fw-bold mb-2">Chargement des graphiques...</h4>
                <p className="text-white-50">Préparation des visualisations de données</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger shadow-lg border-0 rounded-4" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill fs-2 me-3"></i>
                        <div>
                            <h5 className="alert-heading mb-1">Erreur de chargement</h5>
                            <p className="mb-0">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // TRANSFORMATION DES DONNÉES POUR RECHARTS
    // =========================================================================

    // 1. Données Sexe (pour Pie Chart)
    const sexeData = [
        { name: 'Garçons', value: stats.sexeCandidats?.masculins || 0 },
        { name: 'Filles', value: stats.sexeCandidats?.feminins || 0 },
    ].filter(d => d.value > 0);

    // 2. Données Paiements Statut (pour Bar Chart)
    const paiementStatutData = stats.nombrePaiementsStatut?.map(s => ({
        name: s.statut,
        value: s.nombre,
    })) || [];

    // 3. Données Spécialités (pour Bar Chart)
    const specialiteData = Object.entries(stats.candidatsParSpecialite || {}).map(([name, details]) => ({
        name,
        'Garçons': details.garçons,
        'Filles': details.filles,
    }));

    // 4. Données Concours Montants (pour Combined Chart)
    const concoursData = stats.candidatsParConcours?.map(c => ({
        name: c.concours,
        'Candidats': c.nbCandidats,
        'Montant Total (XOF)': c.montantTotal,
    })) || [];

    // 5. Données Filières (pour Bar Chart)
    const filiereData = stats.candidatsParFiliere?.map(f => ({
        name: f.filiere,
        'Total Candidats': f.total,
    })) || [];

    // 6. Données Mentions (pour Bar Chart)
    const mentionData = stats.candidatsParMention?.map(m => ({
        name: m.mention,
        'Nombre': m.total,
    })) || [];

    // 7. Données Régions (pour Pie Chart)
    const regionData = Object.entries(stats.regions || {}).map(([name, data]) => ({
        name,
        value: data.total,
        filles: data.filles,
        garcons: data.garcons
    }));

    // 8. Données Tranches d'âge (pour Area Chart)
    const ageData = Object.entries(stats.tranchesAge || {}).map(([tranche, count]) => ({
        tranche,
        nombre: count
    }));

    // 9. Données Centres d'examen (pour Bar Chart)
    const centresData = stats.centresExamen?.map(c => ({
        name: c.centre,
        'Filles': c.filles,
        'Garçons': c.garcons,
        'Total': c.total
    })) || [];

    // 10. Données Sessions évolution (pour Line Chart)
    const sessionData = stats.candidatsParSession?.map(s => ({
        session: s.session,
        nombre: s.nombre
    })) || [];

    // =========================================================================
    // RENDU DES GRAPHIQUES
    // =========================================================================
    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="text-center mb-5 pb-4">
                <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{ background: `linear-gradient(135deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)` }}>
                    <i className="bi bi-bar-chart-fill text-white fs-4"></i>
                </div>
                <h1 className="display-5 fw-bold mb-2" style={{ background: `linear-gradient(135deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Visualisations des Statistiques
                </h1>
                <p className="text-muted fs-5">Rapport graphique des données clés</p>
            </div>

            <div className="row g-5">
                
                {/* GRAPHIQUE 1: Répartition par Sexe (Pie Chart) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-gender-ambiguous me-2"></i> Répartition des Candidats par Sexe
                            </h5>
                        </div>
                        <div className="card-body p-4 text-center">
                            {stats.totalCandidats > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={sexeData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            labelLine={false}
                                            label={({ percent, name }) => `${name} : ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {sexeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS_SEXE[index % PIE_COLORS_SEXE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucun candidat pour le graphique de sexe.</div>
                            )}
                        </div>
                    </div>
                </div>
                  {/* GRAPHIQUE 3: Répartition Géographique (Pie Chart) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.DANGER} 0%, ${COLORS.SECONDARY} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-geo-alt-fill me-2"></i> Répartition Géographique par Région
                            </h5>
                        </div>
                        <div className="card-body p-4 text-center">
                            {regionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={regionData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            fill="#8884d8"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {regionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name, props) => [
                                            `${value} candidats (F: ${props.payload.filles}, G: ${props.payload.garcons})`,
                                            name
                                        ]} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée géographique à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

              

                {/* GRAPHIQUE 4: Tranches d'âge (Area Chart) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.INFO} 0%, ${COLORS.PRIMARY} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-person-bounding-box me-2"></i> Distribution par Tranche d'Âge
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {ageData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={ageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.INFO} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={COLORS.INFO} stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                        <XAxis dataKey="tranche" stroke={COLORS.INFO} />
                                        <YAxis stroke={COLORS.INFO} />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="nombre" 
                                            stroke={COLORS.INFO} 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorAge)" 
                                            name="Candidats"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée d'âge à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

                  {/* GRAPHIQUE 10: Performance Financière par Concours (ComposedChart) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.BLUE} 0%, ${COLORS.GREEN} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-bar-chart-line-fill me-2"></i> Performance Financière par Concours
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {concoursData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <ComposedChart data={concoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#c3dafe" />
                                        <XAxis dataKey="name" stroke={COLORS.BLUE} />
                                        <YAxis yAxisId="left" orientation="left" stroke={COLORS.BLUE} />
                                        <YAxis yAxisId="right" orientation="right" stroke={COLORS.GREEN} tickFormatter={formatYAxis} />
                                        <Tooltip formatter={(value, name) => [
                                            name.includes('Montant') ? formatCurrency(value) : value, 
                                            name
                                        ]} />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="Candidats" fill={COLORS.BLUE} name="Nombre de Candidats" opacity={0.7} radius={[8, 8, 0, 0]} />
                                        <Line 
                                            yAxisId="right" 
                                            type="monotone" 
                                            dataKey="Montant Total (XOF)" 
                                            stroke={COLORS.GREEN} 
                                            strokeWidth={3} 
                                            dot={{ stroke: COLORS.GREEN, strokeWidth: 2, r: 5 }} 
                                            activeDot={{ r: 8 }}
                                            name="Montant Total"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de concours à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>


                {/* GRAPHIQUE 5: Candidats par Spécialité et Sexe (Bar Chart Stacked) */}
                <div className="col-lg-12">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.SECONDARY} 0%, ${COLORS.DANGER} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-diagram-3-fill me-2"></i> Candidats par Spécialité (Répartition Hommes/Femmes)
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {specialiteData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={specialiteData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                                        <XAxis dataKey="name" stroke={COLORS.SECONDARY} interval={0} angle={-15} textAnchor="end" height={60} />
                                        <YAxis stroke={COLORS.SECONDARY} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Garçons" stackId="a" fill={COLORS.BLUE} />
                                        <Bar dataKey="Filles" stackId="a" fill={COLORS.DANGER} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de spécialité à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE 6: Centres d'Examen (Bar Chart Groupé) */}
                <div className="col-lg-12">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.SUCCESS} 0%, ${COLORS.INFO} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-building-fill me-2"></i> Répartition par Centre d'Examen
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {centresData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={centresData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke={COLORS.SUCCESS} 
                                            angle={-45} 
                                            textAnchor="end" 
                                            height={100}
                                            interval={0}
                                        />
                                        <YAxis stroke={COLORS.SUCCESS} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Filles" fill={COLORS.DANGER} radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="Garçons" fill={COLORS.BLUE} radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de centre d'examen à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE 7: Évolution par Session (Line Chart) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.PRIMARY} 0%, ${COLORS.SECONDARY} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-graph-up me-2"></i> Évolution des Candidatures par Session
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {sessionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={sessionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                        <XAxis dataKey="session" stroke={COLORS.PRIMARY} />
                                        <YAxis stroke={COLORS.PRIMARY} />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="nombre" 
                                            stroke={COLORS.PRIMARY} 
                                            strokeWidth={3}
                                            dot={{ fill: COLORS.PRIMARY, r: 6 }}
                                            activeDot={{ r: 8 }}
                                            name="Nombre de Candidats"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de session à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE 8: Candidats par Filière (Bar Chart Horizontal) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.INFO} 0%, ${COLORS.SECONDARY} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-tag-fill me-2"></i> Candidats par Filière
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {filiereData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={filiereData.length * 50 > 300 ? filiereData.length * 50 : 300}>
                                    <BarChart data={filiereData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                        <XAxis type="number" stroke={COLORS.INFO} />
                                        <YAxis dataKey="name" type="category" stroke={COLORS.INFO} width={100} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Total Candidats" fill={COLORS.INFO} radius={[0, 10, 10, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de filière à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

              
            </div>
        </div>
    );
}