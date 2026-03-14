import os
from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from app.config import settings


def _get_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="CustomTitle",
        parent=styles["Title"],
        fontSize=24,
        textColor=colors.HexColor("#1a365d"),
        spaceAfter=20,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name="SectionHeader",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#2563eb"),
        spaceBefore=16,
        spaceAfter=8,
        borderWidth=1,
        borderColor=colors.HexColor("#2563eb"),
        borderPadding=4,
    ))
    styles.add(ParagraphStyle(
        name="BodyCustom",
        parent=styles["BodyText"],
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY,
    ))
    styles.add(ParagraphStyle(
        name="SmallGray",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#6b7280"),
    ))
    return styles


def generate_convocatoria_pdf(convocatoria) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )
    styles = _get_styles()
    story = []

    story.append(Paragraph("ConvoTracker", styles["CustomTitle"]))
    story.append(Paragraph("Reporte de Convocatoria", styles["SectionHeader"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(convocatoria.titulo, ParagraphStyle(
        name="ConvTitle", parent=styles["Heading1"],
        fontSize=16, textColor=colors.HexColor("#1e3a5f")
    )))
    story.append(Spacer(1, 8))

    story.append(HRFlowable(
        width="100%", thickness=2,
        color=colors.HexColor("#2563eb"), spaceAfter=12
    ))

    info_data = [
        ["Entidad:", convocatoria.entidad],
        ["País:", convocatoria.pais],
        ["Tipo:", convocatoria.tipo],
        ["Estado:", convocatoria.estado],
        ["Sector:", convocatoria.sector or "No especificado"],
    ]
    if convocatoria.fecha_apertura:
        info_data.append(["Fecha apertura:", convocatoria.fecha_apertura.strftime("%d/%m/%Y")])
    if convocatoria.fecha_cierre:
        info_data.append(["Fecha cierre:", convocatoria.fecha_cierre.strftime("%d/%m/%Y")])
    if convocatoria.monto_maximo:
        monto_str = f"{convocatoria.moneda} {convocatoria.monto_minimo:,.0f} - {convocatoria.monto_maximo:,.0f}" if convocatoria.monto_minimo else f"Hasta {convocatoria.moneda} {convocatoria.monto_maximo:,.0f}"
        info_data.append(["Monto:", monto_str])

    info_table = Table(info_data, colWidths=[3.5*cm, 13*cm])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#eff6ff")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1e40af")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 16))

    if convocatoria.descripcion:
        story.append(Paragraph("Descripción", styles["SectionHeader"]))
        story.append(Paragraph(convocatoria.descripcion, styles["BodyCustom"]))
        story.append(Spacer(1, 12))

    if convocatoria.requisitos:
        story.append(Paragraph("Requisitos", styles["SectionHeader"]))
        story.append(Paragraph(convocatoria.requisitos, styles["BodyCustom"]))
        story.append(Spacer(1, 12))

    if convocatoria.beneficiarios:
        story.append(Paragraph("Beneficiarios", styles["SectionHeader"]))
        story.append(Paragraph(convocatoria.beneficiarios, styles["BodyCustom"]))
        story.append(Spacer(1, 12))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor("#e5e7eb"), spaceAfter=8
    ))

    links = []
    if convocatoria.url_fuente:
        links.append(f'<link href="{convocatoria.url_fuente}">Ver convocatoria original</link>')
    if convocatoria.url_terminos:
        links.append(f'<link href="{convocatoria.url_terminos}">Términos de referencia</link>')
    if links:
        story.append(Paragraph("Enlaces: " + " | ".join(links), styles["BodyCustom"]))

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        f"Generado por ConvoTracker el {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        styles["SmallGray"],
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_report_pdf(convocatorias: list, title: str = "Reporte de Convocatorias") -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=1.5*cm, leftMargin=1.5*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )
    styles = _get_styles()
    story = []

    story.append(Paragraph("ConvoTracker", styles["CustomTitle"]))
    story.append(Paragraph(title, styles["SectionHeader"]))
    story.append(Paragraph(
        f"Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M')} | Total: {len(convocatorias)} convocatorias",
        styles["SmallGray"],
    ))
    story.append(Spacer(1, 16))

    header = ["#", "Título", "Entidad", "País", "Estado", "Cierre"]
    data = [header]
    for i, c in enumerate(convocatorias[:100], 1):
        cierre = c.fecha_cierre.strftime("%d/%m/%Y") if c.fecha_cierre else "N/A"
        titulo_short = c.titulo[:60] + "..." if len(c.titulo) > 60 else c.titulo
        data.append([str(i), titulo_short, c.entidad[:30], c.pais, c.estado, cierre])

    col_widths = [1*cm, 7*cm, 4*cm, 2.5*cm, 2*cm, 2.5*cm]
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(table)

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        f"Generado automáticamente por ConvoTracker | {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        styles["SmallGray"],
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
