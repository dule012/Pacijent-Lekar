import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import javax.json.Json;
import javax.json.JsonObject;

@WebServlet(urlPaterrns = {'/'})
public class LoginController extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throw ServletException, IOException{
   try{
       Class.forName("com.mysql.jdbc.Driver");
       Connection c = DriverManager.getConnection("jdbc:mysql://localhost:3306/zdravstvo1", "root", "root");
    String sql = "SELECT ime,prezime,dijagnoza,doktor,izlecen\n FROM karton\n  WHERE izlecen=false";
       PreparedStatemnt ps = c.prepareStatement(sql)
       ResultSet rs = ps.executeQuery();
       obj = {} //ne znam kako se pise u javi
       arr = new ArrayList<>() // valjda array se pise ovako
       while(rs.next()){
           obj.ime = rs.getString('ime')
           obj.prezime = rs.getString('prezime')
           obj.oboljenje = rs.getString('dijagnoza')
           obj.doktor = rs.getString('doktor')
           obj.izlecen = false
           arr.add(obj) // == arr.push(obj)
       }
       response.setContentType("application/json");
       //response.json(arr) iz nodejs ne znam u javi napisati
   }catch(e){
       //error
e.printStackTrace();
   }
    }
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		
		try {
			Class.forName("com.mysql.jdbc.Driver");
		Connection c1 = DriverManager.getConnection("jdbc:mysql://localhost:3306/zdravstvo1", "root", "root");

        JSONObject  jsonObj = new JSONObject(request.getParameter('arrOfObjs'));
        for(int i = 0; i < jsonObj.length; i++){
            if (jsonObj[i].action == "created"){
              String  sql3 = "INSERT INTO karton (ime,prezime,dijagnoza,doktor,izlecen)\n VALUES("+jsonObj[i].ime+" " +jsonObj[i].prezime + " "+jsonObj[i].oboljenje+ " "+jsonObj[i].doktor+ " "+jsonObj[i].izlecen;
		        PreparedStatement ps = c1.prepareStatement(sql);
		        ResultSet rs1 = ps.executeQuery();
            }else if (jsonObj[i].action == "updated" || jsonObj[i].action == "delete"){ // nije mi potrebno delte na frontu kasno sam video
               String sql1 = "UPDATE karton\n SET ime="+ jsonObj[i].ime+" prezime="+jsonObj[i].prezime+" dijagnoza=" +jsonObj[i].oboljenje+ " doktor="+jsonObj[i].doktor+ " izlecen="+true
                PreparedStatement p1 = c1.prepareStatement(sql1);
		        ResultSet rs1 = ps1.executeQuery();
                
                String sql2 ="INSERT INTO NeaktivniPodaci (ime,prezime,dijagnoza,doktor,izlecen)\n VALUES("+jsonObj[i].ime+" " +jsonObj[i].prezime + " "+jsonObj[i].oboljenje+ " "+jsonObj[i].doktor+ " "+true;
                PreparedStatement ps2 = c1.prepareStatement(sql1);
		        ResultSet rs2 = ps2.executeQuery();
            }
        } 
 
		} catch (SQLException e) {
		 //error
         e.printStackTrace();
        }
	}

}