import Header from "../_components/Header";

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex justify-center w-full">
                <Header />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="font-game text-4xl mb-4 text-primary">Bảng giá</h1>
                <p className="font-game text-xl text-muted-foreground">
                    Coming Soon...
                </p>
            </div>
        </div>
    );
}
