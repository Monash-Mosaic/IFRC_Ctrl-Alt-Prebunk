import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/components/header";
import { getTranslations } from "next-intl/server";

// Mock next-intl/server
jest.mock("next-intl/server");

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockGetTranslations = getTranslations as jest.MockedFunction<
  typeof getTranslations
>;

describe("Header", () => {
  const mockTranslations = {
    ifrcLogoAlt: "IFRC Solferino Academy",
    monashLogoAlt: "Monash University MOSAIC",
    title: "CTRL + ALT + PREBUNK",
    titleMobile: "US!",
  };

  beforeEach(() => {
    mockGetTranslations.mockResolvedValue(
      (key: string) => mockTranslations[key as keyof typeof mockTranslations] || key
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the header element", async () => {
    const component = await Header();
    render(component);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("renders the IFRC logo with correct alt text", async () => {
    const component = await Header();
    render(component);

    const logo = screen.getByAltText("IFRC Solferino Academy");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/images/logos/IFRC-Solferino.png");
  });

  it("renders the title link with responsive sizing and svg", async () => {
    const component = await Header();
    const { container } = render(component);

    const titleLink = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href="/"]')
    ).find((link) => link.querySelector("svg"));
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveClass(
      "inline-flex",
      "w-full",
      "max-w-[260px]",
      "items-center",
      "md:max-w-[573px]"
    );

    const titleSvg = titleLink?.querySelector("svg");
    expect(titleSvg).toBeInTheDocument();
  });

  it("renders the Monash logo on desktop", async () => {
    const component = await Header();
    render(component);

    const monashLogo = screen.getByAltText("Monash University MOSAIC");
    expect(monashLogo).toBeInTheDocument();
    expect(monashLogo).toHaveAttribute("src", "/images/logos/Monash-MOSAIC.png");
    const logoContainer = monashLogo.closest("div");
    expect(logoContainer).toHaveClass("hidden", "items-center", "gap-4", "md:flex");
  });

  it("has correct header styling", async () => {
    const component = await Header();
    render(component);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "fixed",
      "top-0",
      "left-0",
      "right-0",
      "z-50",
      "h-14",
      "bg-[#E8E9ED]"
    );
  });

  it("calls getTranslations with correct namespace", async () => {
    await Header();
    expect(mockGetTranslations).toHaveBeenCalledWith("header");
  });
});

