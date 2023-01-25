package com.company.dcmhubroro_m30.webjavaroro_m30;

import java.io.IOException;
import java.net.URL;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.annotation.WebServlet;

import org.pentaho.reporting.engine.classic.core.ClassicEngineBoot;
import org.pentaho.reporting.engine.classic.core.MasterReport;
import org.pentaho.reporting.engine.classic.core.modules.output.pageable.pdf.PdfReportUtil;
import org.pentaho.reporting.libraries.resourceloader.Resource;
import org.pentaho.reporting.libraries.resourceloader.ResourceManager;

@WebServlet("/pentaho")
public class PentahoServlet extends HttpServlet {

  @Override
  public void init(
    ServletConfig config) 
    throws ServletException {

    super.init(config);
    ClassicEngineBoot.getInstance().start();

  }

  @Override
  public void doGet(
    HttpServletRequest request, 
    HttpServletResponse response)
    throws ServletException, IOException {

    doPost(request, response);

  }

  @Override
  public void doPost(
    HttpServletRequest request, 
    HttpServletResponse response)
    throws ServletException, IOException {


    // Prpt file.
	String reportname = request.getParameter("reportname");   
	String reportPath = " ";
	switch (reportname)
	{
		case "FI2000APDC":
			reportPath = "file:" + this.getServletContext().getRealPath("WEB-INF/classes/reports/OP_KREDITOR_002_V14_EN_DC.prpt");
			break;
		case "FI2000APLC":
			reportPath = "file:" + this.getServletContext().getRealPath("WEB-INF/classes/reports/OP_KREDITOR_002_V14_EN_LC.prpt");
			break;
		case "FI2000ARDC":
			reportPath = "file:" + this.getServletContext().getRealPath("WEB-INF/classes/reports/OP_DEBITOR_002_V22_EN_DC.prpt");
			break;
		case "FI2000ARLC":
			reportPath = "file:" + this.getServletContext().getRealPath("WEB-INF/classes/reports/OP_DEBITOR_002_V22_EN_LC.prpt");
			break;
		case "FI2000GLDC":
			reportPath = "file:" + this.getServletContext().getRealPath("WEB-INF/classes/reports/OP_SAKO_002_V14_EN_DC.prpt");
			break;
		case "FI2000GLLC":
			reportPath = "file:" + this.getServletContext().getRealPath("WEB-INF/classes/reports/OP_SAKO_002_V14_EN_LC.prpt");
			break;
	}

    //Selection Parameters
	String mandt = request.getParameter("mandt");
	String bukrs= request.getParameter("bukrs");
	String account_von = request.getParameter("account_von");	
	String p_ktopl = request.getParameter("p_ktopl");
	String debistatus = request.getParameter("debistatus");	
	String stichtag = request.getParameter("stichtag");
	String apstichtag = request.getParameter("apstichtag");
	String apbudatvon = request.getParameter("apbudatvon");
	String apbudatbis = request.getParameter("apbudatbis");	
	String alpbudatvon = request.getParameter("alpbudatvon");
	String alpbudatbis = request.getParameter("alpbudatbis");	
	String lifnr_von = request.getParameter("lifnr_von");    
	String p_hkont = request.getParameter("p_hkont");
	String kunnr_von = request.getParameter("kunnr_von");

    try {

      // Resource manager.
      ResourceManager manager = new ResourceManager();
      manager.registerDefaults();

      // Get report.
      Resource res = manager.createDirectly(new URL(reportPath), MasterReport.class);
      MasterReport report = (MasterReport) res.getResource();
	  report.getParameterValues().put("mandt",mandt);
	  report.getParameterValues().put("bukrs",bukrs);
	  report.getParameterValues().put("kunnr_von",kunnr_von);
	  report.getParameterValues().put("lifnr_von",lifnr_von);	  
	  report.getParameterValues().put("p_hkont",p_hkont);
	  report.getParameterValues().put("debistatus",debistatus);
	  report.getParameterValues().put("stichtag",stichtag);
	  report.getParameterValues().put("apstichtag",apstichtag);
      report.getParameterValues().put("apbudatvon",apbudatvon);
	  report.getParameterValues().put("apbudatbis",apbudatbis);
	  report.getParameterValues().put("alpbudatvon",alpbudatvon);
	  report.getParameterValues().put("alpbudatbis",alpbudatbis);
	  report.getParameterValues().put("p_ktopl",p_ktopl);
	  report.getParameterValues().put("account_von",account_von);
	  
      // Generate report in PDF into the response.
      response.setContentType("application/pdf");
      PdfReportUtil.createPDF(report, response.getOutputStream());

    } catch (Exception e) {
      e.printStackTrace();
    }

  }
}
