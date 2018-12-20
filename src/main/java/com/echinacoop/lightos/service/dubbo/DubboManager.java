package com.echinacoop.lightos.service.dubbo;

import java.io.File;
import java.io.FilenameFilter;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.MessageFormat;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.echinacoop.lightos.domain.dubbo.DubboJar;

public class DubboManager {
	private static final Logger logger = LoggerFactory.getLogger(DubboManager.class);

	private static Map<String, DubboClassLoader> pluginMap = new HashMap<String, DubboClassLoader>();
	private static Map<String, DubboJar> jarsMap = new HashMap<String, DubboJar>();

	private static void addLoader(String jarName, DubboClassLoader loader) {
		pluginMap.put(jarName, loader);
	}

	public static DubboClassLoader getLoader(String jarName) {
		return pluginMap.get(jarName);
	}
	
	public static Collection<DubboJar> loadDubboJars(String jarDir){
		File file = new File(jarDir);
		File[] jarFiles = file.listFiles(new FilenameFilter(){
			@Override
			public boolean accept(File dir, String name) {
				return name.endsWith(".jar");
			}
		});
		if(null != jarFiles){
			File jar = null;
			DubboJar dj = null;
			for (int i = 0; i < jarFiles.length; i++) {
				jar = jarFiles[i];
				if(!jarsMap.containsKey(jar.getName())){
					dj = new DubboJar();
					dj.setJarName(jar.getName());
					dj.setJarPath(MessageFormat.format("file:{0}{1}", jarDir, jar.getName()));
					jarsMap.put(jar.getName(), dj);
				}
			}
		}
		return getLoadedJars();
	}

	public static DubboClassLoader installJar(DubboJar jar) throws MalformedURLException, ClassNotFoundException {
		DubboClassLoader loader = null;
		if(null != jar){
			pluginMap.remove(jar.getJarName());
			URL url = new URL(jar.getJarPath());
			loader = new DubboClassLoader();
			loader.addURLFile(url);
			addLoader(jar.getJarName(), loader);
			jar.setLoaded(true);
			logger.info("install " + jar.getJarName() + "  success");
		}
		return loader;
	}

	public static boolean uninstallJar(DubboJar jar) {
		pluginMap.get(jar.getJarName()).unloadJarFiles();
		jar.setLoaded(false);
		logger.info("uninstall " + jar.getJarName() + "  success");
		return true;
	}
	
	public static Class<?> getJarClass(String jarName, String interfaceName) throws ClassNotFoundException, MalformedURLException{
		DubboJar jar = jarsMap.get(jarName);
		DubboClassLoader loader = null;
		if(null == jar || !jar.isLoaded()){
			loader = installJar(jar);
		} else {
			loader = getLoader(jarName);
		}
		return Class.forName(interfaceName, true, loader);
	}
	
	public static Collection<DubboJar> getLoadedJars(){
		return jarsMap.values();
	}
	
	public static DubboJar getJar(String jarName){
		return jarsMap.get(jarName);
	}
	
	public static boolean deleteJar(String jarName) {
		pluginMap.remove(jarName);
		jarsMap.remove(jarName);
		logger.info("delete " + jarName + "  success");
		return true;
	}
}
