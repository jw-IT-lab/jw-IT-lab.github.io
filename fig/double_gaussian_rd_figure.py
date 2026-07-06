
import math
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from numpy.polynomial.hermite import hermgauss

# -----------------------
# User-tunable parameters
# -----------------------
M = 1.6
SIGMA = 1.0
DISTORTION_CONVENTION = r"d(x,y)=\frac{1}{2}(x-y)^2"
OUT_BASENAME = "double_gaussian_rd_figure"

# -----------------------
# Plot styling
# -----------------------
matplotlib.rcParams["mathtext.fontset"] = "cm"
matplotlib.rcParams["font.family"] = "serif"
matplotlib.rcParams["font.size"] = 12


def log_cosh(x: np.ndarray) -> np.ndarray:
    """Stable evaluation of log(cosh(x))."""
    ax = np.abs(x)
    return ax + np.log1p(np.exp(-2.0 * ax)) - np.log(2.0)


class SymmetricDoubleGaussianRD:
    r"""
    X ~ 1/2 N(-m, sigma^2) + 1/2 N(m, sigma^2)
    Distortion convention: d(x,y) = (x-y)^2 / 2
    """

    def __init__(self, m: float, sigma: float, n_gh: int = 220) -> None:
        self.m = float(m)
        self.sigma = float(sigma)
        self.n_gh = int(n_gh)

        self.gh_x, self.gh_w = hermgauss(self.n_gh)

        self.lambda_threshold = 1.0 / (self.sigma ** 2)
        self.lambda_c = 1.0 / (self.m ** 2 + self.sigma ** 2)
        self.D_threshold = 0.5 * self.sigma ** 2
        self.D_max = 0.5 * (self.m ** 2 + self.sigma ** 2)
        self.hx = self.entropy_source()

    # ---------- source ----------
    def source_pdf(self, x: np.ndarray) -> np.ndarray:
        s2 = self.sigma ** 2
        norm = 1.0 / np.sqrt(2.0 * np.pi * s2)
        return (
            0.5 * norm * np.exp(-0.5 * ((x - self.m) / self.sigma) ** 2)
            + 0.5 * norm * np.exp(-0.5 * ((x + self.m) / self.sigma) ** 2)
        )

    def source_logpdf(self, x: np.ndarray) -> np.ndarray:
        c = -0.5 * np.log(2.0 * np.pi * self.sigma ** 2)
        a = -0.5 * ((x - self.m) / self.sigma) ** 2
        b = -0.5 * ((x + self.m) / self.sigma) ** 2
        mx = np.maximum(a, b)
        return c + np.log(0.5 * np.exp(a - mx) + 0.5 * np.exp(b - mx)) + mx

    # ---------- Gauss-Hermite expectation ----------
    def gh_expect_normal(self, mu: float, sigma: float, f) -> float:
        z = mu + np.sqrt(2.0) * sigma * self.gh_x
        vals = f(z)
        return float(np.dot(self.gh_w, vals) / np.sqrt(np.pi))

    def entropy_source(self) -> float:
        # By symmetry, expectation under one component is enough.
        return self.gh_expect_normal(
            self.m,
            self.sigma,
            lambda z: -self.source_logpdf(z),
        )

    # ---------- discrete branch ----------
    def F(self, a: float, lam: float) -> float:
        return self.gh_expect_normal(
            self.m,
            self.sigma,
            lambda z: z * np.tanh(lam * a * z),
        )

    def solve_a(self, lam: float) -> float:
        r"""
        Solve a = E[X tanh(lambda a X)].
        For lambda <= lambda_c, the unique solution is a = 0.
        """
        if lam <= self.lambda_c + 1e-14:
            return 0.0

        lo, hi = 0.0, self.m

        def g(a: float) -> float:
            return self.F(a, lam) - a

        # Expand right bracket if needed.
        if g(hi) > 0.0:
            hi = self.m + 4.0 * self.sigma
            for _ in range(50):
                if g(hi) < 0.0:
                    break
                hi *= 1.35

        for _ in range(100):
            mid = 0.5 * (lo + hi)
            if g(mid) > 0.0:
                lo = mid
            else:
                hi = mid
        return 0.5 * (lo + hi)

    def discrete_rate_distortion(self, lam: float):
        a = self.solve_a(lam)
        elogcosh = self.gh_expect_normal(
            self.m,
            self.sigma,
            lambda z: log_cosh(lam * a * z),
        )
        R = lam * a * a - elogcosh
        D = 0.5 * (self.m ** 2 + self.sigma ** 2 - a * a)
        return R, D, a

    # ---------- continuous branch / SLB-attaining branch ----------
    def continuous_rate_distortion(self, lam: float):
        D = 1.0 / (2.0 * lam)
        R = self.hx - 0.5 * np.log(2.0 * np.pi * np.e / lam)
        component_var = max(self.sigma ** 2 - 1.0 / lam, 0.0)
        return float(R), float(D), float(component_var)

    # ---------- piecewise actual curve ----------
    def actual_R(self, D: np.ndarray) -> np.ndarray:
        D = np.asarray(D, dtype=float)
        out = np.empty_like(D)

        mask = D <= self.D_threshold
        out[mask] = self.hx - 0.5 * np.log(4.0 * np.pi * np.e * D[mask])

        if np.any(~mask):
            lam_grid = np.linspace(self.lambda_c + 1e-5, self.lambda_threshold - 1e-5, 1200)
            vals = np.array([self.discrete_rate_distortion(lam) for lam in lam_grid])
            Rg, Dg, _ = vals.T
            idx = np.argsort(Dg)
            out[~mask] = np.interp(D[~mask], Dg[idx], Rg[idx])

        return out

    def slb(self, D: np.ndarray) -> np.ndarray:
        D = np.asarray(D, dtype=float)
        return self.hx - 0.5 * np.log(4.0 * np.pi * np.e * D)


def make_figure(model: SymmetricDoubleGaussianRD, output_dir: Path) -> tuple[Path, Path]:
    y_min, y_max = -4.0, 4.0
    y_curve = y_max + 0.22
    D_min = 0.045
    z_max = 1.65
    x_min = 0.0
    x_max = model.D_max + 0.04
    y_front = y_min
    y_back = y_curve
    z_min = 0.0
    z_top = z_max

    D1 = np.linspace(D_min, model.D_threshold, 320)
    D2 = np.linspace(model.D_threshold, model.D_max, 420)
    Dslb = np.linspace(model.D_threshold + 1e-3, model.D_max, 340)

    R1 = model.actual_R(D1)
    R2 = model.actual_R(D2)
    Rslb = model.slb(Dslb)

    bg_base = np.array(matplotlib.colors.to_rgb("#0D1B24"))
    bg_teal = np.array(matplotlib.colors.to_rgb("#183946"))
    bg_cyan = np.array(matplotlib.colors.to_rgb("#2E7C84"))
    bg_amber = np.array(matplotlib.colors.to_rgb("#D88659"))
    bg_ivory = np.array(matplotlib.colors.to_rgb("#F2E6CF"))

    axis_color = "#E7DCC8"
    label_color = "#F3E8D3"
    curve_color = "#F2E4CD"
    slb_color = "#89C9C9"
    highlight_color = "#DFFF74"
    mark_color = "#8BEAE2"
    guide_color = "#B5BBB7"
    source_color = "#A9B4B7"

    # Selected lambda values for the reproduction distributions shown on the planes.
    lam_planes = [
        2.2 / (model.sigma ** 2),
        1.35 / (model.sigma ** 2),
        model.lambda_threshold,
        0.56 / (model.sigma ** 2),
        0.40 / (model.sigma ** 2),
        max(model.lambda_c + 0.02, 0.34 / (model.sigma ** 2)),
    ]
    lam_planes = sorted(lam_planes, reverse=True)

    # Muted, paper-friendly palette.
    palette = [
        "#68DDE4",  # luminous aqua
        "#F4A673",  # amber
        "#5FD59B",  # jade green
        "#B493FF",  # violet
        "#D6A07F",  # copper sand
        "#6E92F5",  # steel blue
    ]

    fig = plt.figure(figsize=(12.0, 7.6), facecolor=bg_base)

    bg_ax = fig.add_axes([0.0, 0.0, 1.0, 1.0], zorder=0)
    bg_ax.set_axis_off()
    nx, ny = 1200, 760
    gx = np.linspace(0.0, 1.0, nx)
    gy = np.linspace(0.0, 1.0, ny)
    XX, YY = np.meshgrid(gx, gy)

    left_glow = np.exp(-(((XX - 0.22) / 0.62) ** 2 + ((YY - 0.36) / 0.68) ** 2))
    right_glow = np.exp(-(((XX - 0.95) / 0.36) ** 2 + ((YY - 0.18) / 0.52) ** 2))
    core_glow = np.exp(-(((XX - 0.67) / 0.13) ** 2 + ((YY - 0.64) / 0.18) ** 2))
    cyan_glow = np.exp(-(((XX - 0.56) / 0.08) ** 2 + ((YY - 0.70) / 0.10) ** 2))

    bg_img = np.broadcast_to(bg_base, (ny, nx, 3)).copy()
    bg_img = bg_img * (1.0 - 0.44 * left_glow[..., None]) + bg_teal * (0.44 * left_glow[..., None])
    bg_img = bg_img * (1.0 - 0.56 * right_glow[..., None]) + bg_amber * (0.56 * right_glow[..., None])
    bg_img = bg_img * (1.0 - 0.63 * core_glow[..., None]) + bg_ivory * (0.63 * core_glow[..., None])
    bg_img = bg_img * (1.0 - 0.24 * cyan_glow[..., None]) + bg_cyan * (0.24 * cyan_glow[..., None])
    bg_ax.imshow(np.clip(bg_img, 0.0, 1.0), origin="lower", extent=[0.0, 1.0, 0.0, 1.0], aspect="auto")

    ax = fig.add_axes([-0.05, -0.08, 1.10, 1.12], projection="3d", zorder=2)
    ax.set_facecolor((0.0, 0.0, 0.0, 0.0))

    # Hide the default 3D frame lines; draw only the visible axes we want.
    for axis in [ax.xaxis, ax.yaxis, ax.zaxis]:
        axis.line.set_color((1.0, 1.0, 1.0, 0.0))
        axis._axinfo["grid"]["linewidth"] = 0.0
        axis.set_ticks([])

    ax.xaxis.set_pane_color((0.13, 0.29, 0.34, 0.28))
    ax.yaxis.set_pane_color((0.10, 0.22, 0.28, 0.22))
    ax.zaxis.set_pane_color((0.11, 0.18, 0.23, 0.12))
    ax.xaxis.pane.set_edgecolor((1.0, 1.0, 1.0, 0.0))
    ax.yaxis.pane.set_edgecolor((1.0, 1.0, 1.0, 0.0))
    ax.zaxis.pane.set_edgecolor((1.0, 1.0, 1.0, 0.0))

    ax.set_xlim(x_min, x_max)
    ax.set_ylim(y_front, y_back)
    ax.set_zlim(z_min, z_top)
    ax.set_box_aspect((1.55, 1.0, 1.0))
    ax.set_proj_type("persp", focal_length=0.78)

    def add_curve_marks(xs, ys, zs, size: float = 44.0) -> None:
        ax.scatter(
            xs,
            ys,
            zs,
            s=size * 1.25,
            marker="x",
            color="white",
            linewidths=3.1,
            depthshade=False,
            zorder=16,
        )
        ax.scatter(
            xs,
            ys,
            zs,
            s=size,
            marker="x",
            color=mark_color,
            linewidths=1.9,
            depthshade=False,
            zorder=17,
        )

    ax.set_xlabel("")
    ax.set_ylabel("")
    ax.set_zlabel("")
    ax.grid(False)

    # Floor guides and vertical lambda markers.
    curve_marks: list[tuple[float, float]] = []
    for lam, color in zip(lam_planes, palette):
        if lam >= model.lambda_threshold:
            R, D, _ = model.continuous_rate_distortion(lam)
        else:
            R, D, _ = model.discrete_rate_distortion(lam)
        R_plot = min(R, z_max)

        ax.plot(
            [D, D],
            [y_front, y_back],
            [0.0, 0.0],
            linestyle=(0, (1.0, 3.0)),
            color=matplotlib.colors.to_rgba(guide_color, 0.34),
            linewidth=0.9,
            zorder=1,
        )
        ax.plot(
            [D, D],
            [y_back, y_back],
            [0.0, R_plot],
            color=color,
            linewidth=1.05,
            linestyle=(0, (3.0, 3.2)),
            alpha=0.96,
            zorder=8,
        )
        if R_plot < z_max - 1e-3:
            curve_marks.append((D, R_plot))

    # Source density on the front plane.
    yy = np.linspace(y_min, y_max, 520)
    density_scale = 1.55
    ax.plot(
        np.zeros_like(yy),
        yy,
        density_scale * model.source_pdf(yy),
        color=source_color,
        linewidth=2.2,
        alpha=0.92,
        zorder=4,
    )

    # Actual R(D) and SLB.
    D_all = np.r_[D1, D2]
    R_all = np.r_[R1, R2]
    ax.plot(
        D_all,
        np.full_like(D_all, y_back),
        np.clip(R_all, 0.0, z_max),
        color="#67C6C8",
        linewidth=8.0,
        alpha=0.08,
        solid_capstyle="round",
        zorder=8,
    )
    ax.plot(
        D1,
        np.full_like(D1, y_back),
        np.clip(R1, 0.0, z_max),
        color=highlight_color,
        linewidth=10.0,
        alpha=0.18,
        solid_capstyle="round",
        zorder=9,
    )
    ax.plot(
        D1,
        np.full_like(D1, y_back),
        np.clip(R1, 0.0, z_max),
        color=highlight_color,
        linewidth=5.2,
        alpha=0.90,
        solid_capstyle="round",
        zorder=10,
    )
    ax.plot(
        D_all,
        np.full_like(D_all, y_back),
        np.clip(R_all, 0.0, z_max),
        color=curve_color,
        linewidth=2.5,
        solid_capstyle="round",
        zorder=11,
    )
    ax.plot(
        Dslb,
        np.full_like(Dslb, y_back),
        np.clip(Rslb, 0.0, z_max),
        color=slb_color,
        linewidth=2.0,
        linestyle=(0, (4.0, 3.0)),
        alpha=0.78,
        zorder=3,
    )

    # Threshold point lambda = sigma^{-2}.
    R_threshold = model.actual_R(np.array([model.D_threshold]))[0]
    ax.scatter(
        [model.D_threshold],
        [y_back],
        [R_threshold],
        s=54,
        color="#F6E6C7",
        edgecolors="#ECA574",
        linewidths=1.1,
        depthshade=False,
        zorder=15,
    )
    if curve_marks:
        D_marks, R_marks = zip(*curve_marks)
        add_curve_marks(D_marks, np.full(len(D_marks), y_back), R_marks)

    # Reproduction distributions on selected D-planes.
    for lam, color in zip(lam_planes, palette):
        if lam > model.lambda_threshold + 1e-12:
            R, D, component_var = model.continuous_rate_distortion(lam)
            s = math.sqrt(component_var)
            dens = (
                0.5
                * (1.0 / np.sqrt(2.0 * np.pi * component_var))
                * np.exp(-0.5 * ((yy - model.m) / s) ** 2)
                + 0.5
                * (1.0 / np.sqrt(2.0 * np.pi * component_var))
                * np.exp(-0.5 * ((yy + model.m) / s) ** 2)
            )
            ax.plot(
                np.full_like(yy, D),
                yy,
                density_scale * dens,
                color=source_color,
                linewidth=1.45,
                alpha=0.82,
                zorder=4,
            )
            yb = np.linspace(y_min, y_max, 18)
            dens_b = (
                0.5
                * (1.0 / np.sqrt(2.0 * np.pi * component_var))
                * np.exp(-0.5 * ((yb - model.m) / s) ** 2)
                + 0.5
                * (1.0 / np.sqrt(2.0 * np.pi * component_var))
                * np.exp(-0.5 * ((yb + model.m) / s) ** 2)
            )
            for y0, z1 in zip(yb, density_scale * dens_b):
                if z1 > 0.02:
                    ax.plot([D, D], [y0, y0], [0.0, z1], color=color, linewidth=1.6, zorder=5)

        elif abs(lam - model.lambda_threshold) <= 1e-12:
            _, D, _ = model.continuous_rate_distortion(lam)
            hbar = 0.54
            for y0 in (-model.m, model.m):
                ax.plot([D, D], [y0, y0], [0.0, hbar], color=color, linewidth=2.6, zorder=6)

        else:
            _, D, a = model.discrete_rate_distortion(lam)
            hbar = 0.54
            if a < 1e-6:
                ax.plot([D, D], [0.0, 0.0], [0.0, hbar], color=color, linewidth=2.8, zorder=6)
            else:
                ax.plot([D, D], [-a, -a], [0.0, hbar], color=color, linewidth=2.8, zorder=6)
                ax.plot([D, D], [a, a], [0.0, hbar], color=color, linewidth=2.8, zorder=6)

    # Draw only the three coordinate axes, arranged like a textbook 3D frame.
    axis_origin = (x_min, y_back, z_min)
    axis_endpoints = [
        (x_max, y_back, z_min),
        (x_min, y_front, z_min),
        (x_min, y_back, z_top),
    ]
    for x1, y1, z1 in axis_endpoints:
        ax.plot(
            [axis_origin[0], x1],
            [axis_origin[1], y1],
            [axis_origin[2], z1],
            color=axis_color,
            linewidth=1.6,
            alpha=0.92,
            zorder=3,
        )

    # Zero-rate endpoint: the optimal reproduction collapses to a single atom at y = 0.
    zero_rate_height = 0.56
    ax.plot(
        [model.D_max, model.D_max],
        [y_front, y_back],
        [0.0, 0.0],
        linestyle=(0, (1.0, 3.0)),
        color=matplotlib.colors.to_rgba(guide_color, 0.34),
        linewidth=0.9,
        zorder=1,
    )
    ax.plot(
        [model.D_max, model.D_max],
        [0.0, 0.0],
        [0.0, zero_rate_height],
        color=curve_color,
        linewidth=3.2,
        zorder=6,
    )
    add_curve_marks([model.D_max], [y_back], [0.0], size=46.0)

    # Labels.
    ax.text(
        x_min + 0.07 * (x_max - x_min),
        y_back - 0.03 * (y_back - y_front),
        z_top * 0.92,
        r"$R(D)$",
        fontsize=22,
        color=label_color,
        zorder=12,
    )
    ax.text2D(
        0.52,
        0.72,
        r"decreasing $\lambda \rightarrow$",
        transform=ax.transAxes,
        fontsize=13.5,
        color=label_color,
        rotation=-15,
        rotation_mode="anchor",
    )
    ax.text(
        model.D_threshold + 0.12,
        y_back - 0.58,
        R_threshold + 0.10,
        r"$\lambda=\sigma^{-2}$",
        fontsize=17,
        color=label_color,
        zorder=14,
    )

    ax.annotate(
        "",
        xy=(0.84, 0.72),
        xytext=(0.74, 0.72),
        xycoords="axes fraction",
        textcoords="axes fraction",
        arrowprops={
            "arrowstyle": "-",
            "color": slb_color,
            "linewidth": 1.9,
            "linestyle": (0, (4.0, 3.0)),
        },
    )
    ax.text2D(
        0.85,
        0.72,
        "SLB",
        transform=ax.transAxes,
        fontsize=14.5,
        color=slb_color,
        va="center",
    )

    ax.view_init(elev=22, azim=-60)

    png_path = output_dir / f"{OUT_BASENAME}.png"
    pdf_path = output_dir / f"{OUT_BASENAME}.pdf"
    fig.savefig(png_path, dpi=100, facecolor=fig.get_facecolor(), edgecolor="none", pad_inches=0.0)
    fig.savefig(pdf_path, facecolor=fig.get_facecolor(), edgecolor="none", pad_inches=0.0)
    plt.close(fig)

    return png_path, pdf_path


def main() -> None:
    output_dir = Path(__file__).resolve().parent
    output_dir.mkdir(parents=True, exist_ok=True)
    model = SymmetricDoubleGaussianRD(M, SIGMA)
    png_path, pdf_path = make_figure(model, output_dir)

    print(f"Saved PNG  : {png_path}")
    print(f"Saved PDF  : {pdf_path}")
    print(f"m = {model.m}, sigma = {model.sigma}")
    print(f"Distortion convention: {DISTORTION_CONVENTION}")
    print(f"lambda_c = {model.lambda_c:.12f}")
    print(f"lambda_threshold = sigma^(-2) = {model.lambda_threshold:.12f}")
    print(f"D_threshold = sigma^2 / 2 = {model.D_threshold:.12f}")
    print(f"D_max = (m^2 + sigma^2) / 2 = {model.D_max:.12f}")


if __name__ == "__main__":
    main()
