import loginBanner from "../../assets/images/login-banner.png";

export function LeftPanel() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#F7F8FC]">
      <img
        src={loginBanner}
        alt="Banner"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}