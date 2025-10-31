const RankingPage = () => {
  return (
    <div className="flex flex-col px-8">
      <h1 className="font-paytone text-7xl">Classement</h1>
      <div className="flex gap-50">
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="flex w-full font-paytone text-5xl items-center text-primary">
            <p className="w-20 text-6xl">1.</p>
            <p className="flex-1">Lucas Stephan</p>
            <p className="text-6xl">640</p>
          </div>
          <div className="flex w-full font-paytone text-5xl items-center text-green">
            <p className="w-20 text-6xl">2.</p>
            <p className="flex-1">Lucas Stephan</p>
            <p className="text-6xl">640</p>
          </div>
          <div className="flex w-full font-paytone text-5xl items-center text-blue">
            <p className="w-20 text-6xl">3.</p>
            <p className="flex-1">Lucas Stephan</p>
            <p className="text-6xl">640</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex w-full font-paytone text-4xl items-center">
            <p className="w-30 text-5xl">4.</p>
            <p className="flex-1">Lucas Stephan</p>
            <p className="text-5xl">640</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
