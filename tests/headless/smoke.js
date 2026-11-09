module.exports={run:async p=>p.evaluate(()=>{for(let i=0;i<2000;i++)step(.05);return{stage:S.stage,gold:S.gold,kills:S.kills}})};
